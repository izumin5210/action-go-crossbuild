#!/usr/bin/env bash

version="v1"

# https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#recommendations
git checkout -b releases/$version
rm -rf node_modules
gsed -i '/node_modules/d' .gitignore
npm install --production
git add node_modules .gitignore
git commit -m node_modules
git push origin -f releases/$version
git checkout master
git branch -D releases/$version
