#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin localization-feature

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge localization-feature
git push origin development
# Step 4: Switch back to localization-feature branch
git checkout localization-feature


# Step 5: ./git-automation.sh "refactor(localization): enable json files to accept FIELD_NAME  dynamically"
#git merge development