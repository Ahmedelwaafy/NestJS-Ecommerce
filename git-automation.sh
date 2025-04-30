#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin order-model

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge order-model
git push origin development
# Step 4: Switch back to order-model branch
git checkout order-model


# Step 5: ./git-automation.sh "chore: merge order model branch to development branch"
#git merge development