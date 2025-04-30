#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin upload-files-feature

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge upload-files-feature
git push origin development
# Step 4: Switch back to upload-files-feature branch
git checkout upload-files-feature


# Step 5: ./git-automation.sh "chore: merge upload-files-feature branch to development branch"
#git merge development