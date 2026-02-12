import Conf from 'conf';

interface ConfigSchema {
  apiToken: string;
  apiUrl: string;
  defaultProjectId: string;
}

export class Config {
  private store: Conf<ConfigSchema>;

  constructor() {
    this.store = new Conf<ConfigSchema>({
      projectName: 'sprintflint',
      defaults: {
        apiToken: '',
        apiUrl: 'https://sprintflint.com/api/v1',
        defaultProjectId: '',
      },
    });
  }

  get apiToken(): string {
    return this.store.get('apiToken');
  }

  set apiToken(token: string) {
    this.store.set('apiToken', token);
  }

  get apiUrl(): string {
    return this.store.get('apiUrl');
  }

  set apiUrl(url: string) {
    this.store.set('apiUrl', url);
  }

  get defaultProjectId(): string {
    return this.store.get('defaultProjectId');
  }

  set defaultProjectId(id: string) {
    this.store.set('defaultProjectId', id);
  }

  isAuthenticated(): boolean {
    return !!this.apiToken;
  }

  clear(): void {
    this.store.clear();
  }
}
