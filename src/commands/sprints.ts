import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI, Sprint } from '../api';

export class SprintsCommand {
  constructor(private config: Config) {}

  async execute(options: { limit: string }): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora('Loading sprints...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const sprints = await api.getSprints(parseInt(options.limit));
      spinner.stop();

      if (sprints.length === 0) {
        console.log(chalk.yellow('No sprints found.'));
        return;
      }

      console.log(chalk.bold('\n📅 Sprints\n'));
      
      sprints.forEach((sprint: Sprint) => {
        const statusColor = {
          planning: chalk.yellow,
          active: chalk.green,
          completed: chalk.gray,
        }[sprint.status];

        const progress = sprint.totalPoints > 0 
          ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
          : 0;

        console.log(`${chalk.bold(sprint.name)} ${statusColor(`[${sprint.status}]`)}`);
        console.log(`  ID: ${sprint.id}`);
        console.log(`  Dates: ${sprint.startDate} → ${sprint.endDate}`);
        console.log(`  Progress: ${sprint.completedPoints}/${sprint.totalPoints} points (${progress}%)`);
        console.log('');
      });
    } catch (error) {
      spinner.fail('Failed to load sprints');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}
