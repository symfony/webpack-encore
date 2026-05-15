# Testing app: lowest-peers-typescript-fork7

This testing app pins `typescript`, `ts-loader`, `@babel/preset-typescript` and `fork-ts-checker-webpack-plugin@7.x` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`. Covers the v7 branch of fork-ts-checker's OR range.

## Installation

```shell
$ (cd ../..; pnpm pack --out webpack-encore.tgz)
$ pnpm install --frozen-lockfile
$ pnpm add --save-dev ../../webpack-encore.tgz
```

## Usage

```
$ pnpm run encore dev
$ pnpm run encore production
```
