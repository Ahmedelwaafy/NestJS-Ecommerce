#!/bin/bash

pnpm run ts
# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin user-model

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge user-model
git push origin development
# Step 4: Switch back to user-model branch
git checkout user-model


# Step 5: ./git-automation.sh "hide all browser logs"
#git merge development