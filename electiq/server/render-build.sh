#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# No extra steps needed for puppeteer in latest versions of Render's Node runtime
# but some users prefer to manually trigger browser download
# npx puppeteer browsers install chrome
