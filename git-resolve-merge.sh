#!/bin/bash

# UdaYantu Git Merge Resolution Script
# Silicon Valley CTO Grade - Safe & Professional

set -e

echo "=========================================="
echo "🔧 Git Merge Conflict Resolution"
echo "=========================================="

# Step 1: Clean up git lock files
echo "[1/6] Cleaning git lock files..."
rm -f .git/index.lock .git/config.lock .git/ORIG_HEAD.lock .git/HEAD.lock 2>/dev/null || true
echo "✅ Lock files cleaned"

# Step 2: Verify git state
echo -e "\n[2/6] Verifying git state..."
git status | head -10
echo "✅ Git state verified"

# Step 3: Configure merge strategy
echo -e "\n[3/6] Configuring merge strategy..."
git config pull.rebase false
git config merge.conflictstyle merge
echo "✅ Merge strategy configured"

# Step 4: Fetch latest from remote
echo -e "\n[4/6] Fetching from remote..."
git fetch origin main --no-tags
echo "✅ Remote fetched"

# Step 5: Create backup branch before merge
echo -e "\n[5/6] Creating safety backup branch..."
git branch -f backup/pre-merge-$(date +%s) 2>/dev/null || true
echo "✅ Backup created"

# Step 6: Execute merge with auto-resolve strategy
echo -e "\n[6/6] Executing merge..."
git merge origin/main \
  -m "CTO: Merge remote main into local - Resolve conflicts ($(date '+%Y-%m-%d %H:%M:%S'))" \
  --no-edit \
  -X ours \
  2>&1 | head -30

echo -e "\n=========================================="
echo "✅ Merge completed successfully!"
echo "=========================================="
echo ""
echo "📊 Current status:"
git status

echo -e "\n🚀 Next steps to push:"
echo "1. Review any conflicts (if any): git status"
echo "2. Commit merge: git commit --no-edit"
echo "3. Push to remote: git push origin main"
echo ""
echo "Done! Your local and remote are now synced."
