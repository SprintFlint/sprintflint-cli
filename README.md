# SprintFlint CLI

Command-line interface for SprintFlint - agile sprint management for teams that want to ship.

## Installation

```bash
npm install -g sprintflint
```

Or use with npx:

```bash
npx sprintflint
```

## Quick Start

```bash
# Authenticate with your API token
sprintflint auth --token <your-api-token>

# Get your token from: https://sprintflint.com/settings/api

# List active sprints
sprintflint sprints

# Show current sprint status
sprintflint status

# List issues in current sprint
sprintflint issues list

# Create a new issue
sprintflint issues create "Fix login bug" --description "Users can't login with SSO" --points 3
```

## Commands

### `sprintflint auth`

Authenticate with your SprintFlint account.

```bash
sprintflint auth --token <your-token>
```

### `sprintflint sprints`

List active sprints.

```bash
sprintflint sprints
sprintflint sprints --limit 20
```

### `sprintflint issues`

Manage issues.

```bash
# List issues
sprintflint issues list
sprintflint issues list --sprint <sprint-id>
sprintflint issues list --status in_progress

# Create issue
sprintflint issues create "Title" --description "Details" --points 5

# Show issue details
sprintflint issues show <issue-id>
```

### `sprintflint status`

Show current sprint status with velocity and burndown.

```bash
sprintflint status
```

### `sprintflint open`

Open SprintFlint in your browser.

```bash
sprintflint open
```

## Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev -- sprints

# Build
npm run build

# Test
npm test
```

## License

MIT
