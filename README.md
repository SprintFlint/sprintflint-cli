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

### Core Commands

| Command | Purpose |
|---------|---------|
| `auth` | Login with API token |
| `sprints` | List sprints |
| `status` | Current sprint status |
| `open` | Open web app |

### Issues Commands

```bash
# List issues
sprintflint issues list
sprintflint issues list --sprint <sprint-id>
sprintflint issues list --status in_progress

# Create issue
sprintflint issues create "Title" --description "Details" --points 5

# Search issues
sprintflint issues search "auth"
sprintflint issues search "bug"

# Your issues
sprintflint issues mine

# Issues by assignee
sprintflint issues assigned neo
```

### Autoplay Commands

```bash
# Trigger AI autoplay on an issue
sprintflint autoplay --issue-id ISS-123

# Watch progress in real-time
sprintflint autoplay --issue-id ISS-123 --watch
```

### Export Commands

```bash
# Export to CSV
sprintflint export --format csv --output issues.csv

# Export to JSON
sprintflint export --format json --output issues.json

# Export specific sprint
sprintflint export --sprint SPRINT-123 --output sprint-123.csv
```

### GitHub Integration

```bash
# Import issues from GitHub
sprintflint github import --repo owner/repo
sprintflint github import --repo owner/repo --labels "bug,urgent"
sprintflint github import --repo owner/repo --sprint SPRINT-123

# Sync issues with GitHub
sprintflint github sync --repo owner/repo
sprintflint github sync --repo owner/repo --bidirectional
```

## Daily Workflows

### Morning Standup Prep

```bash
# Check your issues
sprintflint issues mine

# See current sprint status
sprintflint status
```

### Creating Issues

```bash
# Quick bug report
sprintflint issues create "Fix login bug" --points 2

# Detailed feature request
sprintflint issues create "Add dark mode" \
  --description "Users want dark mode for better nighttime usage" \
  --points 5 \
  --sprint SPRINT-123
```

### Finding Work

```bash
# Search for issues
sprintflint issues search "auth"
sprintflint issues search "bug"

# See what's in review
sprintflint issues list --status review

# Check backlog
sprintflint issues list --status backlog
```

### Team Coordination

```bash
# See what teammate is working on
sprintflint issues assigned neo

# Check all active sprint issues
sprintflint issues list

# See sprint progress
sprintflint status
```

### AI Autoplay

```bash
# Start autoplay on an issue
sprintflint autoplay --issue-id ISS-123

# Watch it work in real-time
sprintflint autoplay --issue-id ISS-123 --watch
```

### Exporting Data

```bash
# Export current sprint for reports
sprintflint export --format csv --output sprint-report.csv

# Export specific sprint
sprintflint export --sprint SPRINT-123 --output sprint-123.json
```

## Power User Tips

### Aliases (add to .bashrc/.zshrc)

```bash
alias sf='sprintflint'
alias sfs='sprintflint status'
alias sfm='sprintflint issues mine'
alias sfme='sprintflint issues mine | grep -E "in_progress|review"'
alias sfsprint='sprintflint sprints'
alias sfimport='sprintflint github import --repo'
alias sfexport='sprintflint export --format csv'
```

### Fuzzy Finding (with fzf)

```bash
# Interactive issue selector
sprintflint issues list --limit 100 | fzf

# Quick open issue
sfopen() {
  local issue_id=$(sprintflint issues search "$1" --limit 20 | fzf | awk '{print $1}')
  [ -n "$issue_id" ] && open "https://sprintflint.com/issues/$issue_id"
}
```

### IDE Integration

**VS Code tasks.json:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "SprintFlint: My Issues",
      "type": "shell",
      "command": "sprintflint issues mine"
    },
    {
      "label": "SprintFlint: Status",
      "type": "shell",
      "command": "sprintflint status"
    }
  ]
}
```

## Filter Options

```bash
# Filter by status
sprintflint issues list --status in_progress
sprintflint issues list --status review
sprintflint issues list --status done

# Limit results
sprintflint issues list --limit 50
sprintflint issues search "api" --limit 10

# By sprint
sprintflint issues list --sprint SPRINT-123
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
