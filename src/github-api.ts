import yaml from 'js-yaml';

interface IGithubApi {
  getDefaultBranchName(repositoryName: string, orgOrUser: string): Promise<string | null>;
  getRepositoriesNameByQuery(query: string, orgOrUser: string): Promise<Array<string> | undefined>;
  getWorkflowsJobsNameByRepository(repositoryName: string, orgOrUser: string): Promise<Array<string> | undefined>;
}

export class GithubApi implements IGithubApi {
  private BASE_API_URL = 'https://api.github.com';
  private BASE_RAW_URL = 'https://raw.githubusercontent.com';

  private readonly headers: { [key: string]: string };
  private readonly githubToken: string | undefined;

  private readonly STATUS_CODE = {
    OK: 200,
    UNPROCESSABLE_ENTITY: 422,
    SERVICE_UNAVAILABLE: 503,
    UNAUTHORIZED: 401,
  }

  constructor(githubToken: string | undefined) {
    this.githubToken = githubToken || process.env.GITHUB_TOKEN;
    this.headers = {
      'Authorization': `token ${this.githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  async getDefaultBranchName(repositoryName: string, orgOrUser: string): Promise<string | null> {
    if (!this.isValidToken()) {
      throw new InvalidTokenError();
    }
    
    const url = `${this.BASE_API_URL}/repos/${orgOrUser}/${repositoryName}`;
    const request = await fetch(url, { headers: this.headers });

    this.requestStatusErrorValidator(request.status);

    if (request.status === this.STATUS_CODE.OK) {
      const response = await request.json();
      return response.default_branch as string || null;
    } else {
      throw new UnexpectedGithubApiError(orgOrUser, request.status);
    }
  }

  async getRepositoriesNameByQuery(query: string, orgOrUser: string): Promise<Array<string> | undefined> {
    if (!this.isValidToken()) {
      throw new InvalidTokenError();
    }

    const url = `${this.BASE_API_URL}/search/repositories?q=${query}+user:${orgOrUser}`;
    const request = await fetch(url, { headers: this.headers });

    this.requestStatusErrorValidator(request.status);

    if (request.status === this.STATUS_CODE.OK) {
      const response = await request.json() as { items: Array<{ name: string; }> };
      return response.items
        .filter(repo => repo.name.includes(query))
        .map(repo => repo.name);
    } else {
      throw new UnexpectedGithubApiError(orgOrUser, request.status);
    }
  }

  async getWorkflowsJobsNameByRepository(repositoryName: string, orgOrUser: string): Promise<Array<string> | undefined> {
    if (!this.isValidToken()) {
      throw new InvalidTokenError();
    }

    const workflowsUrl = `${this.BASE_API_URL}/repos/${orgOrUser}/${repositoryName}/actions/workflows`;
    const workflowsRequest = await fetch(workflowsUrl, { headers: this.headers });
    
    this.requestStatusErrorValidator(workflowsRequest.status);

    const workflowsResponse = await workflowsRequest.json();
    const defaultBranch = await this.getDefaultBranchName(repositoryName, orgOrUser);
    const availableJobsUrl = workflowsResponse.workflows.map((workflow: { path: string }) => `${this.BASE_RAW_URL}/${orgOrUser}/${repositoryName}/${defaultBranch}/${workflow.path}`);

    const jobs: Array<string> = [];

    for (const url of availableJobsUrl) {
      const request = await fetch(url, { headers: this.headers });

      if (request.status === this.STATUS_CODE.OK) {
        const workflowAsText = await request.text();
        const yamlData = yaml.load(workflowAsText) as { jobs: { [key: string]: any } };
        const jobsName = Object.keys(yamlData.jobs);
        jobs.push(...jobsName);
      }
    }

    return Array.from(new Set(jobs.sort()));
  }

  private isValidToken(): boolean {
    return !(!this.githubToken);
  }

  private requestStatusErrorValidator(status: number): void {
    if (status === this.STATUS_CODE.UNAUTHORIZED) {
      throw new UnauthorizedError();
    }

    if (status === this.STATUS_CODE.UNPROCESSABLE_ENTITY) {
      throw new OrgOrUserNotFoundError();
    }

    if (status === this.STATUS_CODE.SERVICE_UNAVAILABLE) {
      throw new ServiceUnavailableError();
    }
  }
}

/**
 * Types of Errors
 */

class InvalidTokenError extends Error {
  constructor() {
    super('Invalid github token. Please check your token and try again.');
    this.name = 'InvalidTokenError';
  }
}

class UnexpectedGithubApiError extends Error {
  constructor(orgOrUser: string, status: number) {
    super(`Unexpected github api error! orgOrUser: ${orgOrUser} status: ${status}.`);
    this.name = 'UnexpectedGithubApiError';
  }
}

class OrgOrUserNotFoundError extends Error {
  constructor() {
    super('Organization or user not found.');
    this.name = 'OrgOrUserNotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized github api token.');
    this.name = 'UnauthorizedError';
  }
}

class ServiceUnavailableError extends Error {
  constructor() {
    super('Github api is unavailable. Please try again later.');
    this.name = 'ServiceUnavailableError';
  }
}