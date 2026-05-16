# Testing app: lowest-peers-svelte4

Pins `svelte@4.2.2` and `svelte-loader@3.1.0` (plus core peer deps) at their lowest supported versions declared in Encore's `peerDependencies`. Covers the v4 branch of svelte's OR range.

## Installation

```shell
$ (cd ../..; pnpm pack --out webpack-encore.tgz)
$ pnpm install --ignore-workspace --frozen-lockfile
$ pnpm add --ignore-workspace --save-dev ../../webpack-encore.tgz
```

## Usage

```
$ pnpm run encore dev
$ pnpm run encore production
```
