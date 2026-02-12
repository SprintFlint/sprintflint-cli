import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI } from '../api';

export class StatusCommand {
  constructor(private config: Config) {}

  async execute(): Promise<void> {
    if (!this.config.isAuthenticated()) {
      console.log(chalk.red('Not authenticated. Run `sprintflint auth` first.'));
      process.exit(1);
    }

    const spinner = ora('Loading sprint status...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const sprint = await api.getActiveSprint();

      if (!sprint) {
        spinner.stop();
        console.log(chalk.yellow('No active sprint found.'));
        return;
      }

      const stats = await api.getSprintStats(sprint.id);
      spinner.stop();

      const progress = stats.totalPoints > 0 
        ? Math.round((stats.completedPoints / stats.totalPoints) * 100)
        : 0;

      console.log(chalk.bold(`\n📊 ${sprint.name}\n`));
      
      // Progress bar
      const barWidth = 30;
      const filled = Math.round((progress / 100) * barWidth);
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      
      console.log(`Progress: ${chalk.cyan(bar)} ${progress}%`);
      console.log(`Points: ${chalk.green(stats.completedPoints)} done / ${chalk.blue(stats.totalPoints)} total / ${chalk.yellow(stats.remainingPoints)} remaining`);
      console.log(`Velocity: ${chalk.cyan(stats.velocity + ' pts/day')}`);
      console.log(`Dates: ${sprint.startDate} → ${sprint.endDate}`);
      
      if (stats.burndown.length > 0) {
        console.log(chalk.bold('\nBurndown (last 7 days):'));
        stats.burndown.slice(-7).forEach((point: { date: string; remaining: number }) => {
          const date = new Date(point.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          console.log(`  ${date}: ${chalk.yellow(point.remaining + ' pts')}`);
        });
      }

      console.log(chalk.dim(`\nhttps://sprintflint.com/sprints/${sprint.id}`));
    } catch (error) {
      spinner.fail('Failed to load status');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}
