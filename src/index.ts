#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { AuthCommand } from './commands/auth';
import { SprintsCommand } from './commands/sprints';
import { IssuesCommand } from './commands/issues';
import { StatusCommand } from './commands/status';
import { AutoplayCommand } from './commands/autoplay';
import { ExportCommand } from './commands/export';
import { GitHubCommand } from './commands/github';
import { Config } from './config';

const program = new Command();
const config = new Config();

program
  .name('sprintflint')
  .description('CLI for SprintFlint - agile sprint management')
  .version('0.2.0');

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

// Autoplay command
program
  .command('autoplay')
  .description('Trigger AI autoplay on an issue')
  .option('--issue-id <id>', 'Issue ID to autoplay')
  .option('--watch', 'Watch progress in real-time')
  .action(async (options) => {
    const cmd = new AutoplayCommand(config);
    await cmd.execute(options);
  });

// Export command
program
  .command('export')
  .description('Export issues to CSV or JSON')
  .option('--format <format>', 'Export format (csv, json)', 'csv')
  .option('--output <file>', 'Output file path')
  .option('--sprint <id>', 'Sprint ID to export')
  .action(async (options) => {
    const cmd = new ExportCommand(config);
    await cmd.execute(options);
  });

// GitHub integration command
const githubCmd = program
  .command('github')
  .description('GitHub integration');

githubCmd
  .command('import')
  .description('Import issues from GitHub')
  .requiredOption('--repo <repo>', 'Repository (owner/repo)')
  .option('--labels <labels>', 'Comma-separated labels to filter')
  .option('--milestone <milestone>', 'Milestone to filter')
  .option('--sprint <id>', 'Target sprint ID')
  .action(async (options) => {
    const cmd = new GitHubCommand(config);
    await cmd.importIssues(options);
  });

githubCmd
  .command('sync')
  .description('Sync issues with GitHub')
  .requiredOption('--repo <repo>', 'Repository (owner/repo)')
  .option('--bidirectional', 'Two-way sync', false)
  .action(async (options) => {
    const cmd = new GitHubCommand(config);
    await cmd.sync(options);
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
