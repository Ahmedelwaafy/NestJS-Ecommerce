#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin auth-model

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge auth-model
git push origin development
# Step 4: Switch back to auth-model branch
git checkout auth-model


# Step 5: ./git-automation.sh "feat:(auth): add outh 'google'"
#git merge development