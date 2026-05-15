# Testing app: lowest-peers-less

This testing app pins `less` and `less-loader` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`.

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
