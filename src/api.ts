import axios, { AxiosInstance } from 'axios';
import { Config } from './config';

export interface Sprint {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  points: number;
  assignee: string | null;
  sprintId: string;
  createdAt: string;
}

export class SprintFlintAPI {
  private client: AxiosInstance;

  constructor(config: Config) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Run `sprintflint auth` to login.');
        }
        throw error;
      }
    );
  }

  async getSprints(limit: number = 10): Promise<Sprint[]> {
    const response = await this.client.get('/sprints', { params: { limit } });
    return response.data.sprints;
  }

  async getActiveSprint(): Promise<Sprint | null> {
    const response = await this.client.get('/sprints/active');
    return response.data.sprint || null;
  }

  async getIssues(sprintId?: string, status?: string, limit: number = 20): Promise<Issue[]> {
    const params: any = { limit };
    if (sprintId) params.sprint_id = sprintId;
    if (status) params.status = status;
    
    const response = await this.client.get('/issues', { params });
    return response.data.issues;
  }

  async createIssue(title: string, description?: string, points?: number, sprintId?: string): Promise<Issue> {
    const response = await this.client.post('/issues', {
      title,
      description,
      points,
      sprint_id: sprintId,
    });
    return response.data.issue;
  }

  async getIssue(id: string): Promise<Issue> {
    const response = await this.client.get(`/issues/${id}`);
    return response.data.issue;
  }

  async getSprintStats(sprintId: string): Promise<{
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    velocity: number;
    burndown: { date: string; remaining: number }[];
  }> {
    const response = await this.client.get(`/sprints/${sprintId}/stats`);
    return response.data;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.client.defaults.baseURL}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.data.valid === true;
    } catch {
      return false;
    }
  }

  async searchIssues(query: string, limit: number = 20): Promise<Issue[]> {
    const response = await this.client.get('/issues/search', { 
      params: { q: query, limit } 
    });
    return response.data.issues;
  }

  async getCurrentUser(): Promise<{ username: string; email: string; id: string }> {
    const response = await this.client.get('/auth/me');
    return response.data.user;
  }

  async getIssuesByAssignee(username: string, limit: number = 20): Promise<Issue[]> {
    const response = await this.client.get('/issues', { 
      params: { assignee: username, limit } 
    });
    return response.data.issues;
  }
}
