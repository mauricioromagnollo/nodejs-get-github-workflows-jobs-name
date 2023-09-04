import dotenv from 'dotenv'
import yaml from 'js-yaml'

dotenv.config()

export class GHWrapper {
  constructor() {
    this.pat = process.env.GH_PAT
    this.headers = {
      'Authorization': `token ${this.pat}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  }

  async #getDefaultBranch(owner, repositoryName) {
    const url = `https://api.github.com/repos/${owner}/${repositoryName}`
    const request = await fetch(url, { headers: this.headers })
    const response = await request.json()
    return response.default_branch || null
  }

  async getJobs(owner, repositoryName) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repositoryName}/actions/workflows`
      const request = await fetch(url, { headers: this.headers })
      
      if (request.status === 200) {
        const response = await request.json()
        const defaultBranch = await this.#getDefaultBranch(owner, repositoryName)
        const urls = response.workflows.map(workflow => `https://raw.githubusercontent.com/${owner}/${repositoryName}/${defaultBranch}/${workflow.path}`)
        const jobs = await this.#getJobsNames(urls)
        return jobs 
      } else {
        console.log(await request.text())
      }
    } catch (error) {
      console.log({
        error: error.message
      })
    }
  }

  async #getJobsNames(urls) {
    const jobs = []
    for (const url of urls) {
      const request = await fetch(url, { headers: this.headers })
      if (request.status === 200) {
        const text = await request.text()
        const yamlData = yaml.load(text);
        const jobKeys = Object.keys(yamlData.jobs);
        jobs.push(...jobKeys)
      } else {
        // some error, maybe some workflows files couldn't exist ?!
        return []
      }
    }

    const jobList = new Set(jobs.sort())

    return {
      jobs_count: jobList.size,
      jobs: Array.from(jobList)
    }
  }
}