# Create TypeScript Fast

This project is generated by [create-ts-fast](https://github.com/yangshun/create-ts-fast), a tool for scaffolding npm libraries written in TypeScript.

## Directory walkthrough

The project has the following files and directories:

```
├── .github/workflows/ci.yml
├── dist
├── src
│   ├── __tests__
│   └── index.ts
├── package.json
├── README.md
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

- `src`: Contains source code
  - `__tests__`: Directory containing tests. Code within `__tests__` will be ignored during build
  - `index.ts`: Main file
- `package.json`: Self explanatory
- `README.md`: Project's README file. Contents will be displayed on the package homepage on npmjs.com and repo homepage of github.com
- `tsconfig.json`: Base TypeScript config. Used when developing
- `tsup.config.json`: tsup config. Refer to its [documentation for customization](https://tsup.egoist.dev/#using-custom-configuration)
- `vitest.config.ts`: Vitest config. Refer to its [documentation for customization](https://vitest.dev/config/)
- `dist`: Directory containing generated files. The contents of this directory is published
- `.github/workflows/ci.yml`: GitHub action that runs typechecks, tests and build

## Publish to NPM via github action
Create an account on https://www.npmjs.com/
create a token

On npm go to settings -> secret and variables -> actions -> new repository secret
then add your npm secret under the key NODE_AUTH_TOKEN

then in your package.json add
```json
  "repository": {
    "type": "git",
    "url": "https://github.com/<github org or username>/<repo name>.git"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  },
```

## Commands

- `npm run typecheck`: Checks code within `src` for TypeScript issues. No artifacts are generated
- `npm test`: Single test run using Vitest
- `npm run test:watch`: Watch mode. Runs all test suites and reruns them when there are changes
- `npm run build`: Compiles `src` into CommonJS and ES modules (along with TypeScript declaration files) into the `dist` directory
- `npm run verify`: Run typechecks + tests + build. Suitable when developing and in CI environments to ensure all checks are valid
- `npm run clean`: Deletes the `dist` directory
# create-ts-fast-template
