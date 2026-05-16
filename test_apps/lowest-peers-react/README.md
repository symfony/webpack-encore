# Testing app: lowest-peers-react

This testing app pins `@babel/preset-react` and `@babel/plugin-transform-react-jsx` (plus core peer deps) to their lowest supported versions declared in Encore's `peerDependencies`.

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
