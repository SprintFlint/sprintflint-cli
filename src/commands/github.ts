import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI } from '../api';

export class GitHubCommand {
  constructor(private config: Config) {}

  async importIssues(options: {
    repo: string;
    labels?: string;
    milestone?: string;
    sprint?: string;
  }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora(`Importing issues from ${options.repo}...`).start();

    try {
      const api = new SprintFlintAPI(this.config);
      const result = await api.importFromGitHub({
        repo: options.repo,
        labels: options.labels?.split(','),
        milestone: options.milestone,
        targetSprintId: options.sprint,
      });

      spinner.succeed('Import complete!');
      console.log(chalk.green(`\n✓ Imported ${result.imported} issues`));
      
      if (result.skipped > 0) {
        console.log(chalk.yellow(`⚠ Skipped ${result.skipped} duplicates`));
      }

      if (result.issues.length > 0) {
        console.log(chalk.bold('\nImported issues:'));
        result.issues.forEach((issue: any) => {
          console.log(`  ${chalk.dim(issue.id)} ${issue.title}`);
        });
      }
    } catch (error) {
      spinner.fail('Import failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  async sync(options: { repo: string; bidirectional?: boolean }): Promise<void> {
    const spinner = ora('Syncing with GitHub...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const result = await api.syncWithGitHub({
        repo: options.repo,
        bidirectional: options.bidirectional || false,
      });

      spinner.succeed('Sync complete!');
      console.log(chalk.green(`\n✓ Synced ${result.updated} issues`));
      
      if (result.created > 0) {
        console.log(`  Created: ${result.created}`);
      }
      if (result.updated > 0) {
        console.log(`  Updated: ${result.updated}`);
      }
    } catch (error) {
      spinner.fail('Sync failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}
