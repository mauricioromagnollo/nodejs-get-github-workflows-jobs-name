# nodejs-get-github-workflows-jobs-name

A simple code to fetch only job names from a Github repository.

> This code was a conversion from Python to JavaScript, from the original repository [https://github.com/ambrisolla/github-wrapper](https://github.com/ambrisolla/github-wrapper/tree/main).

## Usage

Export Github PAT:

```sh
export GH_PAT='your_GitHub_PAT'
```

or set in `.env` file:

```sh
mv .env.example .env
```

`.env`
```
GH_PAT='your_GitHub_PAT'
```

Install dependencies:

- You need Node.js 18.17.1 version.

```sh
npm ci
```

Run:

```sh
node cli.js owner/repoName
```

```sh
# Example:
node cli.js mauricioromagnollo/eslint-config
```

Output:

```js
{ jobs_count: 2, jobs: [ 'publish', 'tests' ] }
```
