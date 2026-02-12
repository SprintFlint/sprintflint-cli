import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI } from '../api';

export class AutoplayCommand {
  constructor(private config: Config) {}

  async execute(options: { issueId?: string; watch?: boolean }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    if (!options.issueId) {
      console.log(chalk.red('Please provide --issue-id'));
      console.log(chalk.dim('Example: sprintflint autoplay --issue-id ISS-123'));
      process.exit(1);
    }

    const spinner = ora(`Starting autoplay for ${options.issueId}...`).start();

    try {
      const api = new SprintFlintAPI(this.config);
      const run = await api.triggerAutoplay(options.issueId);

      spinner.succeed('Autoplay started!');
      console.log(chalk.green(`\n🤖 Agent is now working on: ${options.issueId}`));
      console.log(`Run ID: ${run.id}`);
      console.log(`Status: ${run.status}`);
      
      if (options.watch) {
        console.log(chalk.blue('\nWatching progress... (Ctrl+C to stop)'));
        await this.watchProgress(api, run.id);
      } else {
        console.log(chalk.dim(`\nWatch progress: sprintflint autoplay --run-id ${run.id} --watch`));
      }
      
      console.log(chalk.dim(`\nView in app: https://sprintflint.com/runs/${run.id}`));
    } catch (error) {
      spinner.fail('Failed to start autoplay');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  private async watchProgress(api: SprintFlintAPI, runId: string): Promise<void> {
    const pollInterval = 5000; // 5 seconds
    
    while (true) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const status = await api.getAutoplayStatus(runId);
        
        if (status.status === 'completed') {
          console.log(chalk.green('\n✓ Autoplay completed!'));
          console.log(`Commits: ${status.commits.length}`);
          console.log(`Files changed: ${status.filesChanged}`);
          break;
        } else if (status.status === 'failed') {
          console.log(chalk.red('\n✗ Autoplay failed'));
          console.log(`Error: ${status.error}`);
          break;
        } else {
          process.stdout.write(chalk.blue('.'));
        }
      } catch (error) {
        console.log(chalk.yellow('\nLost connection, retrying...'));
      }
    }
  }
}
