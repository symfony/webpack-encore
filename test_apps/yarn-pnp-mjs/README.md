# Testing app: Yarn Plug'n'Play (with .mjs config)

This testing app is used to test how Encore installation and usage work when using the [**Yarn** package manager](https://yarnpkg.com/) with Plug'n'Play and a `webpack.config.mjs` file instead of `"type": "module"` in `package.json`.

## Installation

```shell
$ (cd ../..; yarn pack --filename webpack-encore.tgz)
$ yarn set version 4.3.0
$ yarn add --dev ../../webpack-encore.tgz
$ yarn install
```

## Usage

```
$ yarn run encore dev
$ yarn run encore production
```
