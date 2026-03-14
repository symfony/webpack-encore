#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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
