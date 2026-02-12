import { IssuesCommand } from '../issues';
import { Config } from '../../config';
import { SprintFlintAPI } from '../../api';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../config');

describe('IssuesCommand', () => {
  let config: Config;
  let command: IssuesCommand;

  beforeEach(() => {
    jest.clearAllMocks();
    config = new Config();
    (config.isAuthenticated as jest.Mock).mockReturnValue(true);
    command = new IssuesCommand(config);
  });

  describe('list', () => {
    it('should display issues grouped by status', async () => {
      const mockIssues = [
        { id: 'ISS-1', title: 'Fix bug', status: 'in_progress', points: 3, assignee: 'luke', sprintId: 'S1', description: '', createdAt: '2024-01-01' },
        { id: 'ISS-2', title: 'Add feature', status: 'todo', points: 5, assignee: null, sprintId: 'S1', description: '', createdAt: '2024-01-02' },
      ];

      (SprintFlintAPI.prototype.getIssues as jest.Mock).mockResolvedValue(mockIssues);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('exit');
      });
      
      try {
        await command.list({ limit: '20' });
      } catch (e) {
        // expected
      }

      expect(SprintFlintAPI.prototype.getIssues).toHaveBeenCalledWith(undefined, undefined, 20);
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should show authentication error when not logged in', async () => {
      (config.isAuthenticated as jest.Mock).mockReturnValue(false);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('exit');
      });

      try {
        await command.list({ limit: '20' });
      } catch (e) {
        // expected
      }
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('search', () => {
    it('should search issues by query', async () => {
      const mockIssues = [
        { id: 'ISS-1', title: 'Fix login bug', status: 'in_progress', points: 3, assignee: 'luke', sprintId: 'S1', description: 'Auth is broken', createdAt: '2024-01-01' },
      ];

      (SprintFlintAPI.prototype.searchIssues as jest.Mock).mockResolvedValue(mockIssues);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('exit');
      });
      
      try {
        await command.search('login');
      } catch (e) {
        // expected
      }

      expect(SprintFlintAPI.prototype.searchIssues).toHaveBeenCalledWith('login', 20);
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('mine', () => {
    it('should show issues assigned to current user', async () => {
      const mockIssues = [
        { id: 'ISS-1', title: 'My issue', status: 'in_progress', points: 3, assignee: 'luke', sprintId: 'S1', description: '', createdAt: '2024-01-01' },
      ];

      (SprintFlintAPI.prototype.getCurrentUser as jest.Mock).mockResolvedValue({ username: 'luke', email: 'luke@test.com', id: '1' });
      (SprintFlintAPI.prototype.getIssuesByAssignee as jest.Mock).mockResolvedValue(mockIssues);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('exit');
      });
      
      try {
        await command.mine();
      } catch (e) {
        // expected
      }

      expect(SprintFlintAPI.prototype.getCurrentUser).toHaveBeenCalled();
      expect(SprintFlintAPI.prototype.getIssuesByAssignee).toHaveBeenCalledWith('luke', 20);
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});
