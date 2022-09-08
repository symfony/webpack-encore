# Testing app: Yarn Plug'n'Play (with external Babel configuration file) 

This testing app is used to test how Encore installation and usage work when using the [**Yarn** package manager](https://yarnpkg.com/) 
with the [Plug'N'Play feature](https://yarnpkg.com/features/pnp) enabled.

## Installation

```shell
$ (cd ../..; yarn pack --filename webpack-encore.tgz)
$ yarn add --dev ../../webpack-encore.tgz
$ yarn install
```

## Usage

```
$ yarn run encore dev
$ yarn run encore production
```