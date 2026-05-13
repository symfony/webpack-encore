# Testing app: lowest-peers-svelte3

Pins `svelte@3.50.0` and `svelte-loader@3.1.0` (plus core peer deps) at their lowest supported versions declared in Encore's `peerDependencies`. Covers the v3 branch of svelte's OR range.

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
