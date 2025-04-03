#!/bin/bash

# Step 1: Add and commit changes
git add -A
git commit -m "$1"

# Step 2: Push to the current branch
git push origin product-model

# Step 3: Checkout development branch, pull updates, merge, and push
git checkout development
git pull origin development
git merge product-model
git push origin development
# Step 4: Switch back to product-model branch
git checkout product-model


# Step 5: ./git-automation.sh "initialize the product-model"
#git merge development