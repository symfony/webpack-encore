# Testing app: lowest-peers-sass

This testing app pins `sass` and `sass-loader` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`. It catches regressions that would break Encore against the oldest still-supported sass toolchain.

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
