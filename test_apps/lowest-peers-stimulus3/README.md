# Testing app: lowest-peers-stimulus3

Pins `@symfony/stimulus-bridge@3.0.0` (plus core peer deps) at its lowest supported version declared in Encore's `peerDependencies`. Covers the v3 branch of stimulus-bridge's OR range.

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
