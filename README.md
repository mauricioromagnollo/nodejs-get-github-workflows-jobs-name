# nodejs-github-api

An [Github API](https://docs.github.com/pt/rest?apiVersion=2022-11-28) integration developed with Node.js and TypeScript.

> This code was a conversion from Python to JavaScript, from the original repository [https://github.com/ambrisolla/github-wrapper](https://github.com/ambrisolla/github-wrapper/tree/main).

## **Techs**

- [node.js](https://nodejs.org/en) - v18.17.1
- [typescript](https://www.typescriptlang.org/docs/)
- [jest](https://jestjs.io/pt-BR/docs/getting-started)
- [js-yaml](https://github.com/nodeca/js-yaml)
- [tsx](https://github.com/esbuild-kit/tsx)
- [dotenv](https://github.com/motdotla/dotenv)

## **Usage**

Install [Node.js](https://nodejs.org/en) in version **18.17.1** then install package dependencies:

```sh
npm ci
```

Create your `.env` file and set the variables:

```sh
cp `.env.example` `.env`
```

- `GITHUB_TOKEN` &rarr; Your Github Token;
- `REPOSITORY_NAME` &rarr; The name of the repository you want to test; 
- `ORG_OR_USER`&rarr; The Github Organization name or your user name;
- `QUERY` &rarr; The query with the word you want to search for repositories that include it in the name;

## **Commands/Scripts**

Run [main.ts](./src/main.ts) file

```sh
npm run dev
```

Run [main.ts](./src/main.ts) file in watch mode

```sh
npm run dev:watch
```

Run tests with coverage

```sh
npm run test
```

Run test in watch mode

```sh
npm run test:watch
```