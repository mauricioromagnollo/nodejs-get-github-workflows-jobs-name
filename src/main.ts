import dotenv from 'dotenv';
dotenv.config();

import { GithubApi } from "./github-api";

async function main() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPOSITORY_NAME = process.env.REPOSITORY_NAME || '';
  const ORG_OR_USER = process.env.ORG_OR_USER || '';
  const QUERY = process.env.QUERY || '';

  const githubApi = new GithubApi(GITHUB_TOKEN);

  // const jobsNames = await githubApi.getWorkflowsJobsNameByRepository(REPOSITORY_NAME, ORG_OR_USER);
  // console.log({ jobsNames });
  
  const countOfJobsRunned = await githubApi.getCountOfJobsRunned(REPOSITORY_NAME, ORG_OR_USER);
  // console.log({ countOfJobsRunned });
  
  const hasGithubActions = await githubApi.hasGithubActions(REPOSITORY_NAME, ORG_OR_USER);
  // console.log({ hasGithubActions });

  // const repositoriesNames = await githubApi.getRepositoriesNameByQuery(QUERY, ORG_OR_USER);
  // console.log({ repositoriesNames });
  
  // const defaultBranchName = await githubApi.getDefaultBranchName(REPOSITORY_NAME, ORG_OR_USER);
  // console.log({ defaultBranchName });
}

main()