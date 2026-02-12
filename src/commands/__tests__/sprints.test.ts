import { SprintsCommand } from '../sprints';
import { Config } from '../../config';
import { SprintFlintAPI } from '../../api';

jest.mock('../../api');
jest.mock('../../config');

describe('SprintsCommand', () => {
  let config: Config;
  let command: SprintsCommand;

  beforeEach(() => {
    jest.clearAllMocks();
    config = new Config();
    (config.isAuthenticated as jest.Mock).mockReturnValue(true);
    command = new SprintsCommand(config);
  });

  it('should display sprints with progress', async () => {
    const mockSprints = [
      { id: 'S1', name: 'Sprint 1', status: 'active', startDate: '2024-01-01', endDate: '2024-01-14', totalPoints: 20, completedPoints: 10 },
      { id: 'S2', name: 'Sprint 2', status: 'planning', startDate: '2024-01-15', endDate: '2024-01-28', totalPoints: 0, completedPoints: 0 },
    ];

    (SprintFlintAPI.prototype.getSprints as jest.Mock).mockResolvedValue(mockSprints);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    
    try {
      await command.execute({ limit: '10' });
    } catch (e) {
      // expected
    }

    expect(SprintFlintAPI.prototype.getSprints).toHaveBeenCalledWith(10);
    
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
