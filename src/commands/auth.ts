import chalk from 'chalk';
import ora from 'ora';
import { Config } from '../config';
import { SprintFlintAPI } from '../api';

export class AuthCommand {
  constructor(private config: Config) {}

  async execute(options: { token?: string }): Promise<void> {
    let token = options.token;

    if (!token) {
      console.log(chalk.blue('Get your API token from: https://sprintflint.com/settings/api'));
      console.log('');
      
      // In a real CLI, we'd use inquirer for prompts
      // For now, require --token flag
      console.log(chalk.red('Please provide --token <your-token>'));
      process.exit(1);
    }

    const spinner = ora('Validating token...').start();

    try {
      const api = new SprintFlintAPI(this.config);
      const isValid = await api.validateToken(token);

      if (!isValid) {
        spinner.fail('Invalid token');
        process.exit(1);
      }

      this.config.apiToken = token;
      spinner.succeed('Authenticated successfully!');
      console.log(chalk.green('✓ Token saved to config'));
    } catch (error) {
      spinner.fail('Authentication failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}
