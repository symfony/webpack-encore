# Testing app: pnpm (with .mjs config)

This testing app is used to test how Encore installation and usage work when using the [**pnpm** package manager](https://pnpm.io/) with a `webpack.config.mjs` file instead of `"type": "module"` in `package.json`.

## Installation

```shell
$ (cd ../..; yarn pack --filename webpack-encore.tgz)
$ pnpm add --save-dev ../../webpack-encore.tgz
$ pnpm install
```

## Usage

```
$ pnpm run encore dev
$ pnpm run encore production
```
