# Testing app: npm 

This testing app is used to test how Encore installation and usage work when using the [**npm** package manager](https://docs.npmjs.com/cli/).

## Installation

```shell
$ (cd ../..; yarn pack --filename webpack-encore.tgz)
$ npm add --save-dev ../../webpack-encore.tgz
$ npm install
```

## Usage

```
$ npm run encore dev
$ npm run encore production
```