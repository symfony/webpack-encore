# Testing app: lowest-peers-typescript-fork9

Pins `fork-ts-checker-webpack-plugin@9.0.0` (plus TypeScript toolchain at its lowest supported versions). Covers the v9 branch of fork-ts-checker's OR range.

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
