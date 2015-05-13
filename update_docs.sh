#!/bin/sh
rsync -avz --delete --exclude '.git' ./dist/docs/ ./gh-pages/