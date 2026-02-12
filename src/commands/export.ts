import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI } from '../api';
import * as fs from 'fs';
import * as path from 'path';

export class ExportCommand {
  constructor(private config: Config) {}

  async execute(options: { 
    format: 'csv' | 'json';
    output?: string;
    sprint?: string;
  }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora(`Exporting issues as ${options.format}...`).start();

    try {
      const api = new SprintFlintAPI(this.config);
      const issues = await api.getIssues(options.sprint, undefined, 1000);
      
      spinner.stop();

      let output: string;
      let extension: string;

      if (options.format === 'csv') {
        output = this.toCSV(issues);
        extension = 'csv';
      } else {
        output = JSON.stringify(issues, null, 2);
        extension = 'json';
      }

      const filename = options.output || `sprintflint-export-${new Date().toISOString().split('T')[0]}.${extension}`;
      const filepath = path.resolve(filename);

      fs.writeFileSync(filepath, output);

      console.log(chalk.green(`✓ Exported ${issues.length} issues to ${filepath}`));
      
      if (options.format === 'csv') {
        console.log(chalk.dim('Columns: ID, Title, Status, Points, Assignee, Sprint, Created'));
      }
    } catch (error) {
      spinner.fail('Export failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  private toCSV(issues: any[]): string {
    const headers = ['ID', 'Title', 'Status', 'Points', 'Assignee', 'Sprint', 'Created'];
    const rows = issues.map(issue => [
      issue.id,
      `"${issue.title.replace(/"/g, '""')}"`,
      issue.status,
      issue.points || 0,
      issue.assignee || '',
      issue.sprintId || '',
      issue.createdAt,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
