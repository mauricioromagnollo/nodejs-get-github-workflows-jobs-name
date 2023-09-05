import { describe, it, expect, beforeEach } from '@jest/globals';

import { GithubApi } from './github-api';

const makeMockApiResponse = ({ status, statusText, body }: { status: number, statusText: string, body: object }) => {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const makeMockApiResponseText = ({ status, statusText, text }: { status: number, statusText: string, text: string }) => {
  return new Response(text, {
    status,
    statusText,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

const makeExpectedHeaders = (githubToken: string) => {
  return {
    "headers": {
      "Accept": "application/vnd.github.v3+json", 
      "Authorization": `token ${githubToken}`
    }
  }
}

const makeGetRepositoriesByQueryExpectedUrl = (query: string, orgOrUser: string): string => (
  `https://api.github.com/search/repositories?q=${query}+user:${orgOrUser}`
)

describe('Github API', () => {
  describe('getDefaultBranchName', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    })

    it('should throw InvalidTokenError when token is invalid', async () => {
      const invalidTokens = [
        undefined,
        '',
      ]

      for (const invalidToken of invalidTokens) {
        const githubApi = new GithubApi(invalidToken);
        const promise = githubApi.getDefaultBranchName('any_repo', 'any_org');
        await expect(promise).rejects.toThrow('Invalid github token. Please check your token and try again.');
      }
    })

    it('should throw UnauthorizedError when token is not authorized to request', async () => {
      const githubToken = 'unauthorized_token';
      const repositoryName = 'any_repo'
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 401,
        statusText: 'Unauthorized',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getDefaultBranchName(repositoryName, orgOrUser);
      await expect(promise).rejects.toThrow('Unauthorized github api token.');
    });

    it('should throw OrgOrUserNotFoundError when org or user is not found', async () => {
      const githubToken = 'any_token';
      const repositoryName = 'any_repo'
      const orgOrUser = 'not_found';

      const mockResponse = makeMockApiResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getDefaultBranchName(repositoryName, orgOrUser);
      await expect(promise).rejects.toThrow('Organization or user not found.');
    });

    it('should throw ServiceUnavailableError github api is out', async () => {
      const githubToken = 'any_token';
      const repositoryName = 'any_repo'
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 503,
        statusText: 'Service unavailable',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getDefaultBranchName(repositoryName, orgOrUser);
      await expect(promise).rejects.toThrow('Github api is unavailable. Please try again later.');
    });

    it('should throw UnexpectedGithubApiError when request status is unknow', async () => {
      const githubToken = 'any_token';
      const repositoryName = 'any_repo'
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 500,
        statusText: 'Service unavailable',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getDefaultBranchName(repositoryName, orgOrUser);
      await expect(promise).rejects.toThrow(`Unexpected github api error! orgOrUser: ${orgOrUser} status: ${mockResponse.status}.`);
    });

    it('should return default branch name', async () => {
      const githubToken = 'any_token';
      const repositoryName = 'any_repo'
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 200,
        statusText: 'OK',
        body: { default_branch: 'master' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const expectedUrl = `https://api.github.com/repos/${orgOrUser}/${repositoryName}`;
      const expectedHeaders = makeExpectedHeaders(githubToken);

      const githubApi = new GithubApi(githubToken);
      const receivedDefaultBranchName = await githubApi.getDefaultBranchName(repositoryName, orgOrUser);

      expect(receivedDefaultBranchName).toEqual('master');
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedHeaders);
    });

    it('should return default branch as null when not found', async () => {
      const githubToken = 'any_token';
      const repositoryName = 'any_repo'
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 200,
        statusText: 'OK',
        body: { default_branch: undefined }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const expectedUrl = `https://api.github.com/repos/${orgOrUser}/${repositoryName}`;
      const expectedHeaders = makeExpectedHeaders(githubToken);

      const githubApi = new GithubApi(githubToken);
      const receivedDefaultBranchName = await githubApi.getDefaultBranchName(repositoryName, orgOrUser);

      expect(receivedDefaultBranchName).toEqual(null);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedHeaders);
    });
  });

  describe('getRepositoriesNameByQuery', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    })

    it('should throw InvalidTokenError when token is invalid', async () => {
      const invalidTokens = [
        undefined,
        '',
      ]

      for (const invalidToken of invalidTokens) {
        const githubApi = new GithubApi(invalidToken);
        const promise = githubApi.getRepositoriesNameByQuery('any_query', 'any_org');
        await expect(promise).rejects.toThrow('Invalid github token. Please check your token and try again.');
      }
    });

    it('should throw UnauthorizedError when token is not authorized to request', async () => {
      const githubToken = 'unauthorized_token';
      const query = 'any_query';
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 401,
        statusText: 'Unauthorized',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getRepositoriesNameByQuery(query, orgOrUser);
      await expect(promise).rejects.toThrow('Unauthorized github api token.');
    });

    it('should throw OrgOrUserNotFoundError when org or user is not found', async () => {
      const githubToken = 'any_token';
      const query = 'any_query';
      const orgOrUser = 'not_found';

      const mockResponse = makeMockApiResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getRepositoriesNameByQuery(query, orgOrUser);
      await expect(promise).rejects.toThrow('Organization or user not found.');
    });

    it('should throw ServiceUnavailableError github api is out', async () => {
      const githubToken = 'any_token';
      const query = 'any_query';
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 503,
        statusText: 'Service unavailable',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getRepositoriesNameByQuery(query, orgOrUser);
      await expect(promise).rejects.toThrow('Github api is unavailable. Please try again later.');
    });

    it('should throw UnexpectedGithubApiError when request status is unknow', async () => {
      const githubToken = 'any_token';
      const query = 'any_query';
      const orgOrUser = 'valid_org';

      const mockResponse = makeMockApiResponse({
        status: 500,
        statusText: 'Service unavailable',
        body: { message: 'any_message' }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const githubApi = new GithubApi(githubToken);
      const promise = githubApi.getRepositoriesNameByQuery(query, orgOrUser);
      await expect(promise).rejects.toThrow(`Unexpected github api error! orgOrUser: ${orgOrUser} status: ${mockResponse.status}.`);
    });

    it('should return empty array when any repository includes query in name', async () => {
      const githubToken = 'any_token';
      const query = 'not-found';
      const orgOrUser = 'any_org';

      const mockItems = [
        { name: 'repo_name_1' },
        { name: 'repo_name_2' },
      ];

      const mockResponse = makeMockApiResponse({
        status: 200, 
        statusText: 'OK', 
        body: { items: mockItems }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const expectedUrl = makeGetRepositoriesByQueryExpectedUrl(query, orgOrUser);
      const expectedHeaders = makeExpectedHeaders(githubToken);

      const githubApi = new GithubApi(githubToken);
      const receivedRepositoryNames = await githubApi.getRepositoriesNameByQuery(query, orgOrUser);

      expect(receivedRepositoryNames).toEqual([]);
      expect(receivedRepositoryNames).toHaveLength(0);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedHeaders);
    });

    it('should return only repositories that name includes query', async () => {
      const query = 'repo';
      const orgOrUser = 'any_org';
      const githubToken = 'any_token';

      const mockItems = [
        { name: 'repo_name_1' },
        { name: 'repo_name_2' },
        { name: 'any-other'}
      ];

      const mockResponse = makeMockApiResponse({
        status: 200, 
        statusText: 'OK', 
        body: { items: mockItems }
      });

      jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const expectedRepositoryNames = mockItems
        .filter(repo => repo.name.includes(query))
        .map(item => item.name);
      const expectedUrl = makeGetRepositoriesByQueryExpectedUrl(query, orgOrUser);
      const expectedHeaders = makeExpectedHeaders(githubToken);

      const githubApi = new GithubApi(githubToken);
      const receivedRepositoryNames = await githubApi.getRepositoriesNameByQuery(query, orgOrUser);

      expect(receivedRepositoryNames).toEqual(expectedRepositoryNames);
      expect(receivedRepositoryNames).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedHeaders);
    });
  });

  describe('getWorkflowsJobsNameByRepository', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    })

    it('should throw InvalidTokenError when token is invalid', async () => {
      const invalidTokens = [
        undefined,
        '',
      ]

      for (const invalidToken of invalidTokens) {
        const githubApi = new GithubApi(invalidToken);
        const promise = githubApi.getWorkflowsJobsNameByRepository('any_repo', 'any_org');
        await expect(promise).rejects.toThrow('Invalid github token. Please check your token and try again.');
      }
    })

    it('should return jobs name when repository has valid workflows', async () => {
      const githubToken = 'any_token';
      const orgOrUser = 'valid_org';
      const repositoryName = 'any_repo';

      const mockWorkflows = [
        { path: '.github/workflows/publish.yml', },
        { path: '.github/workflows/pull_request.yml', },
      ]

      const workFlowText1 = `name: Publish Package\n` +
      `on:\n` +
      `  pull_request:\n` +
      `    branches:\n` +
      `      - master\n` +
      `jobs:\n` +
      `  publish:\n` +
      `    runs-on: ubuntu-latest\n` +
      `    steps:\n` +
      `      - uses: actions/checkout@v2\n` +
      `      - name: Setup Node.js\n` +
      `        uses: actions/setup-node@v2\n` +
      `        with:\n` +
      `          node-version: '18'\n` +
      `          registry-url: 'https://registry.npmjs.org'\n` +
      `      - name: Install Dependencies\n` +
      `        run: npm i\n` +
      `      - name: Run Tests\n` +
      `        run: npm test\n`;

      const workFlowText2 = 'name: Pull Request\n' +
      'on:\n' +
      '  push:\n' +
      '    branches:\n' +
      '      - master\n' +
      'jobs:\n' +
      '  tests:\n' +
      '    runs-on: ubuntu-latest\n' +
      '    steps:\n' +
      '      - uses: actions/checkout@v2\n' +
      '\n' +
      '      - name: Setup Node.js\n' +
      '        uses: actions/setup-node@v2\n' +
      '        with:\n' +
      "          node-version: '18'\n" +
      "          registry-url: 'https://registry.npmjs.org'\n" +
      '        env:\n' +
      '          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}\n' +
      '\n' +
      '      - name: Install Dependencies\n' +
      '        run: npm i\n' +
      '\n' +
      '      - name: Run Tests\n' +
      '        run: npm test\n' +
      '\n' +
      '      - name: Publish\n' +
      '        run: npm publish --access public\n' +
      '        env:\n' +
      '          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}\n'  

      const mockWorkflowsResponse = makeMockApiResponse({
        status: 200, 
        statusText: 'OK', 
        body: { workflows: mockWorkflows }
      });

      const mockJobUrlResponse1 = makeMockApiResponseText({
        status: 200,
        statusText: 'OK',
        text: workFlowText1,
      });

      const mockJobUrlResponse2 = makeMockApiResponseText({
        status: 200,
        statusText: 'OK',
        text: workFlowText2,
      });

      const mockDefaultBranch = 'master';

      const mockDefaultBranchName = jest.spyOn(GithubApi.prototype, 'getDefaultBranchName').mockResolvedValue(mockDefaultBranch);
      const mockFetchResponse = jest.spyOn(global, 'fetch')
        .mockResolvedValueOnce(mockWorkflowsResponse)
        .mockResolvedValueOnce(mockJobUrlResponse1)
        .mockResolvedValueOnce(mockJobUrlResponse2);
      
      const expectedAvailableJobsUrl = mockWorkflows
        .map(availableJob => `https://raw.githubusercontent.com/${orgOrUser}/${repositoryName}/${mockDefaultBranch}/${availableJob.path}`)

      const expectedJobsName = [
        'publish',
        'tests',
      ]

      const githubApi = new GithubApi(githubToken);
      const receivedJobsName = await githubApi.getWorkflowsJobsNameByRepository(repositoryName, orgOrUser);

      expect(receivedJobsName).toEqual(expectedJobsName);
      expect(mockDefaultBranchName.mock.calls[0][0]).toEqual(repositoryName);
      expect(mockDefaultBranchName.mock.calls[0][1]).toEqual(orgOrUser);
      expect(mockFetchResponse.mock.calls[0]).toEqual([
        `https://api.github.com/repos/${orgOrUser}/${repositoryName}/actions/workflows`,
        makeExpectedHeaders(githubToken)
      ]);
      expect(mockFetchResponse.mock.calls[1]).toEqual([
        expectedAvailableJobsUrl[0],
        makeExpectedHeaders(githubToken)
      ]);
      expect(mockFetchResponse.mock.calls[2]).toEqual([
        expectedAvailableJobsUrl[1],
        makeExpectedHeaders(githubToken)
      ]);
    })
  });
});