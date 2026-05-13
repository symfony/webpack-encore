# Testing app: lowest-peers-typescript-fork8

Pins `fork-ts-checker-webpack-plugin@8.0.0` (plus TypeScript toolchain at its lowest supported versions). Covers the v8 branch of fork-ts-checker's OR range.

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
