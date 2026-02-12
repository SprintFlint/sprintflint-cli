#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { AuthCommand } from './commands/auth';
import { SprintsCommand } from './commands/sprints';
import { IssuesCommand } from './commands/issues';
import { StatusCommand } from './commands/status';
import { Config } from './config';

const program = new Command();
const config = new Config();

program
  .name('sprintflint')
  .description('CLI for SprintFlint - agile sprint management')
  .version('0.1.0');

// Auth command
program
  .command('auth')
  .description('Authenticate with SprintFlint API')
  .option('--token <token>', 'API token')
  .action(async (options) => {
    const cmd = new AuthCommand(config);
    await cmd.execute(options);
  });

// Sprints command
program
  .command('sprints')
  .description('List active sprints')
  .option('--limit <number>', 'Limit results', '10')
  .action(async (options) => {
    const cmd = new SprintsCommand(config);
    await cmd.execute(options);
  });

// Issues command with subcommands
const issuesCmd = program
  .command('issues')
  .description('Manage issues');

issuesCmd
  .command('list')
  .description('List issues in current sprint')
  .option('--sprint <id>', 'Sprint ID (defaults to active sprint)')
  .option('--status <status>', 'Filter by status')
  .option('--limit <number>', 'Limit results', '20')
  .action(async (options) => {
    const cmd = new IssuesCommand(config);
    await cmd.list(options);
  });

issuesCmd
  .command('create <title>')
  .description('Create a new issue')
  .option('--description <text>', 'Issue description')
  .option('--points <number>', 'Story points')
  .option('--sprint <id>', 'Sprint ID')
  .action(async (title, options) => {
    const cmd = new IssuesCommand(config);
    await cmd.create(title, options);
  });

issuesCmd
  .command('search <query>')
  .description('Search issues by title or description')
  .option('--limit <number>', 'Limit results', '20')
  .action(async (query, options) => {
    const cmd = new IssuesCommand(config);
    await cmd.search(query, options);
  });

issuesCmd
  .command('mine')
  .description('Show issues assigned to you')
  .option('--limit <number>', 'Limit results', '20')
  .action(async (options) => {
    const cmd = new IssuesCommand(config);
    await cmd.mine(options);
  });

issuesCmd
  .command('assigned <username>')
  .description('Show issues assigned to a user')
  .option('--limit <number>', 'Limit results', '20')
  .action(async (username, options) => {
    const cmd = new IssuesCommand(config);
    await cmd.assigned(username, options);
  });

// Status command
program
  .command('status')
  .description('Show current sprint status and velocity')
  .action(async () => {
    const cmd = new StatusCommand(config);
    await cmd.execute();
  });

// Open command
program
  .command('open')
  .description('Open SprintFlint in browser')
  .action(async () => {
    const { exec } = require('child_process');
    exec('open https://sprintflint.com');
    console.log(chalk.blue('Opening SprintFlint...'));
  });

program.parse();
