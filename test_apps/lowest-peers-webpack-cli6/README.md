# Testing app: lowest-peers-webpack-cli6

Pins `webpack@5.82.0` and `webpack-cli@6.0.0` exactly (plus core Babel peer deps). Acts as a minimal baseline confirming Encore works against the v6 branch of webpack-cli's OR range with no optional feature enabled.

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
