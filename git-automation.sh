#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin brand-model

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge brand-model
git push origin development
# Step 4: Switch back to brand-model branch
git checkout brand-model


# Step 5: ./git-automation.sh "finish brand-model"
#git merge development