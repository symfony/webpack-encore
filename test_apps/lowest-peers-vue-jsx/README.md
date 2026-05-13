# Testing app: lowest-peers-vue-jsx

This testing app pins `vue`, `vue-loader`, `@vue/compiler-sfc` and `@vue/babel-plugin-jsx` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`. Exercises the Vue 3 JSX integration.

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
