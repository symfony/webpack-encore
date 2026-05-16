# Testing app: lowest-peers-typescript5

Pins `typescript@5.0.2` and `@babel/preset-typescript` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`. Exercises the Babel TypeScript preset path (`enableBabelTypeScriptPreset()`), without `ts-loader` / `fork-ts-checker`.

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
