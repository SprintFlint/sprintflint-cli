# SprintFlint CLI - Test Suite

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- issues.test.ts

# Watch mode
npm test -- --watch
```

## Test Structure

```
src/
  commands/
    __tests__/
      issues.test.ts      # Issues command tests
      sprints.test.ts     # Sprints command tests
      auth.test.ts        # Auth command tests
      status.test.ts      # Status command tests
  api.ts
  config.ts
```

## Writing Tests

### Command Tests

```typescript
import { IssuesCommand } from '../src/commands/issues';
import { Config } from '../src/config';
import { SprintFlintAPI } from '../src/api';

jest.mock('../src/api');

describe('IssuesCommand', () => {
  let config: Config;
  let command: IssuesCommand;

  beforeEach(() => {
    config = new Config();
    config.apiToken = 'test-token';
    command = new IssuesCommand(config);
  });

  it('should handle authentication errors', async () => {
    config.apiToken = '';
    // Test auth check
  });

  it('should display formatted output', async () => {
    // Mock API response
    // Test console output formatting
  });
});
```

### API Tests

```typescript
describe('SprintFlintAPI', () => {
  it('should validate tokens', async () => {
    // Test token validation
  });

  it('should handle 401 errors', async () => {
    // Test auth error handling
  });
});
```

## Coverage Requirements

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Mocking

### API Mock

```typescript
jest.mock('../src/api', () => {
  return {
    SprintFlintAPI: jest.fn().mockImplementation(() => ({
      getIssues: jest.fn(),
      createIssue: jest.fn(),
      searchIssues: jest.fn(),
      getCurrentUser: jest.fn(),
    })),
  };
});
```

### Config Mock

```typescript
jest.mock('../src/config', () => {
  return {
    Config: jest.fn().mockImplementation(() => ({
      apiToken: 'test-token',
      apiUrl: 'https://test.sprintflint.com',
      isAuthenticated: () => true,
    })),
  };
});
```

## Integration Tests

```bash
# Run against staging API
SPRINTFLINT_API_URL=https://staging.sprintflint.com npm test

# Run with real auth (be careful!)
SPRINTFLINT_API_TOKEN=$TOKEN npm test
```
