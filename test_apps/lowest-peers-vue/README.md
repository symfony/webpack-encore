# Testing app: lowest-peers-vue

This testing app pins `vue`, `vue-loader` and `@vue/compiler-sfc` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`. No JSX — see `lowest-peers-vue-jsx` for the JSX variant.

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
