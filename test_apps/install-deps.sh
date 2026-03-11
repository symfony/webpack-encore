#!/usr/bin/env bash

set -e

for dir in $(find . -type d -name "npm*"); do
  echo "Installing dependencies for $dir"
  (cd "$dir" && npm install)
done

for dir in $(find . -type d -name "yarn*"); do
  echo "Installing dependencies for $dir"
  (cd "$dir" && yarn)
done

for dir in $(find . -type d -name "pnpm*"); do
  echo "Installing dependencies for $dir"
  (cd "$dir" && pnpm install)
done
