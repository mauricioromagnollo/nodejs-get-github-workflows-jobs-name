import { GHWrapper } from './src/gh-wrapper.js';

async function main() {
  const gh = new GHWrapper()
  const [owner, repoName] = process.argv[2].split('/')
  const jobsNames = await gh.getJobs(owner, repoName)
  console.log(jobsNames)
}

main()