#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin sub-categories-model

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge sub-categories-model
git push origin development
# Step 4: Switch back to sub-categories-model branch
git checkout sub-categories-model


# Step 5: ./git-automation.sh "finish sub-categories-model"
#git merge development