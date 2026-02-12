import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI, Issue } from '../api';

export class IssuesCommand {
  constructor(private config: Config) {}

  async list(options: { 
    sprint?: string; 
    status?: string; 
    limit: string;
  }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora('Loading issues...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const issues = await api.getIssues(
        options.sprint,
        options.status,
        parseInt(options.limit)
      );
      spinner.stop();

      if (issues.length === 0) {
        console.log(chalk.yellow('No issues found.'));
        return;
      }

      console.log(chalk.bold(`\n🎫 Issues (${issues.length})\n`));

      // Group by status
      const grouped = issues.reduce((acc: { [key: string]: Issue[] }, issue) => {
        acc[issue.status] = acc[issue.status] || [];
        acc[issue.status].push(issue);
        return acc;
      }, {});

      const statusOrder = ['backlog', 'todo', 'in_progress', 'review', 'done'];
      
      statusOrder.forEach(status => {
        const statusIssues = grouped[status];
        if (!statusIssues || statusIssues.length === 0) return;

        const statusColors: { [key: string]: any } = {
          backlog: chalk.gray,
          todo: chalk.white,
          in_progress: chalk.blue,
          review: chalk.yellow,
          done: chalk.green,
        };
        const statusColor = statusColors[status] || chalk.white;

        console.log(statusColor.bold(`\n${this.formatStatus(status)} (${statusIssues.length})`));
        
        statusIssues.forEach((issue: Issue) => {
          const points = issue.points > 0 ? chalk.cyan(`[${issue.points}pts]`) : '';
          const assignee = issue.assignee ? chalk.dim(`@${issue.assignee}`) : chalk.dim('unassigned');
          console.log(`  ${chalk.dim(issue.id)} ${issue.title} ${points} ${assignee}`);
        });
      });

      console.log('');
    } catch (error) {
      spinner.fail('Failed to load issues');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  async create(title: string, options: {
    description?: string;
    points?: string;
    sprint?: string;
  }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora('Creating issue...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const issue = await api.createIssue(
        title,
        options.description,
        options.points ? parseInt(options.points) : undefined,
        options.sprint
      );

      spinner.succeed('Issue created!');
      console.log(chalk.green(`\n✓ Created: ${issue.title}`));
      console.log(`  ID: ${issue.id}`);
      console.log(`  URL: https://sprintflint.com/issues/${issue.id}`);
    } catch (error) {
      spinner.fail('Failed to create issue');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  async show(id: string): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora('Loading issue...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const issue = await api.getIssue(id);
      spinner.stop();

      const statusColor = {
        backlog: chalk.gray,
        todo: chalk.white,
        in_progress: chalk.blue,
        review: chalk.yellow,
        done: chalk.green,
      }[issue.status];

      console.log(chalk.bold(`\n🎫 ${issue.title}\n`));
      console.log(`ID: ${issue.id}`);
      console.log(`Status: ${statusColor(this.formatStatus(issue.status))}`);
      console.log(`Points: ${issue.points || '-'}`);
      console.log(`Assignee: ${issue.assignee || chalk.dim('unassigned')}`);
      console.log(`Created: ${issue.createdAt}`);
      
      if (issue.description) {
        console.log(chalk.bold('\nDescription:'));
        console.log(issue.description);
      }
      
      console.log(chalk.dim(`\nhttps://sprintflint.com/issues/${issue.id}`));
    } catch (error) {
      spinner.fail('Failed to load issue');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  private formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async search(query: string, options?: { limit?: string }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora(`Searching for "${query}"...`).start();

    try {
      const api = new SprintFlintAPI(this.config);
      const issues = await api.searchIssues(query, parseInt(options?.limit || '20'));
      spinner.stop();

      if (issues.length === 0) {
        console.log(chalk.yellow(`No issues found matching "${query}".`));
        return;
      }

      console.log(chalk.bold(`\n🔍 Search Results for "${query}" (${issues.length})\n`));

      issues.forEach((issue: Issue) => {
        const points = issue.points > 0 ? chalk.cyan(`[${issue.points}pts]`) : '';
        const assignee = issue.assignee ? chalk.dim(`@${issue.assignee}`) : chalk.dim('unassigned');
        const statusColor = {
          backlog: chalk.gray,
          todo: chalk.white,
          in_progress: chalk.blue,
          review: chalk.yellow,
          done: chalk.green,
        }[issue.status] || chalk.white;
        
        console.log(`  ${chalk.dim(issue.id)} ${statusColor(this.formatStatus(issue.status))} ${issue.title} ${points} ${assignee}`);
      });

      console.log('');
    } catch (error) {
      spinner.fail('Search failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  async mine(options?: { limit?: string }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora('Loading your issues...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const user = await api.getCurrentUser();
      const issues = await api.getIssuesByAssignee(user.username, parseInt(options?.limit || '20'));
      spinner.stop();

      if (issues.length === 0) {
        console.log(chalk.yellow('No issues assigned to you.'));
        return;
      }

      console.log(chalk.bold(`\n👤 Your Issues (${issues.length})\n`));

      // Group by status
      const grouped = issues.reduce((acc: { [key: string]: Issue[] }, issue) => {
        acc[issue.status] = acc[issue.status] || [];
        acc[issue.status].push(issue);
        return acc;
      }, {});

      const statusOrder = ['in_progress', 'review', 'todo', 'backlog', 'done'];
      
      statusOrder.forEach(status => {
        const statusIssues = grouped[status];
        if (!statusIssues || statusIssues.length === 0) return;

        const statusColors: { [key: string]: any } = {
          backlog: chalk.gray,
          todo: chalk.white,
          in_progress: chalk.blue,
          review: chalk.yellow,
          done: chalk.green,
        };
        const statusColor = statusColors[status] || chalk.white;

        console.log(statusColor.bold(`\n${this.formatStatus(status)} (${statusIssues.length})`));
        
        statusIssues.forEach((issue: Issue) => {
          const points = issue.points > 0 ? chalk.cyan(`[${issue.points}pts]`) : '';
          console.log(`  ${chalk.dim(issue.id)} ${issue.title} ${points}`);
        });
      });

      console.log('');
    } catch (error) {
      spinner.fail('Failed to load your issues');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  async assigned(username: string, options?: { limit?: string }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora(`Loading issues assigned to @${username}...`).start();

    try {
      const api = new SprintFlintAPI(this.config);
      const issues = await api.getIssuesByAssignee(username, parseInt(options?.limit || '20'));
      spinner.stop();

      if (issues.length === 0) {
        console.log(chalk.yellow(`No issues assigned to @${username}.`));
        return;
      }

      console.log(chalk.bold(`\n👤 Issues assigned to @${username} (${issues.length})\n`));

      issues.forEach((issue: Issue) => {
        const points = issue.points > 0 ? chalk.cyan(`[${issue.points}pts]`) : '';
        const statusColor = {
          backlog: chalk.gray,
          todo: chalk.white,
          in_progress: chalk.blue,
          review: chalk.yellow,
          done: chalk.green,
        }[issue.status] || chalk.white;
        
        console.log(`  ${chalk.dim(issue.id)} ${statusColor(this.formatStatus(issue.status))} ${issue.title} ${points}`);
      });

      console.log('');
    } catch (error) {
      spinner.fail('Failed to load issues');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}
