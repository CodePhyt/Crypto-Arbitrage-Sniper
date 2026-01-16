# Git Setup Guide - ArbHunter

Quick guide to set up git and push the ArbHunter project to a repository.

## Initial Git Setup

### 1. Initialize Git Repository (if not already done)

```bash
# Navigate to project root
cd "C:\Users\Kadir\Desktop\Crypto Arbitrage Sniper"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ArbHunter v1.0.0 - Complete crypto arbitrage scanner"
```

### 2. Check What Will Be Committed

```bash
# See what files will be added
git status

# See what files are ignored
git status --ignored
```

### 3. Verify Important Files Are Included

**Must be committed:**
- ✅ All source code (`.py`, `.dart` files)
- ✅ Configuration files (`requirements.txt`, `pubspec.yaml`)
- ✅ Documentation (`.md` files)
- ✅ Project structure files
- ✅ Startup scripts

**Should NOT be committed:**
- ❌ `__pycache__/` directories
- ❌ `venv/` or `.venv/` virtual environments
- ❌ `.env` files (if any)
- ❌ Build artifacts (`build/`, `dist/`)
- ❌ IDE files (`.idea/`, `.vscode/`)
- ❌ Sound files (user-provided)

## Creating a Remote Repository

### GitHub / GitLab / Bitbucket

1. **Create a new repository** on your platform
   - Name: `arbhunter` or `crypto-arbitrage-sniper`
   - Description: "High-frequency crypto arbitrage scanner"
   - Visibility: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

2. **Add remote and push:**

```bash
# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/arbhunter.git

# Or for SSH:
git remote add origin git@github.com:YOUR_USERNAME/arbhunter.git

# Push to remote
git branch -M main
git push -u origin main
```

## What Gets Committed

### ✅ Included Files

**Backend:**
- `backend/*.py` - All Python source files
- `backend/requirements.txt` - Dependencies
- `backend/README.md` - Documentation
- `backend/test_connection.py` - Test utility

**Frontend:**
- `frontend/lib/**/*.dart` - All Dart source files
- `frontend/pubspec.yaml` - Flutter dependencies
- `frontend/analysis_options.yaml` - Linter config
- `frontend/README.md` - Documentation
- `frontend/assets/sounds/.gitkeep` - Placeholder for sounds

**Documentation:**
- All `.md` files in root
- `roadmap.txt` - Original specifications

**Configuration:**
- `.gitignore` - Git ignore rules
- `.gitattributes` - Line ending rules
- `start_backend.bat` / `start_backend.sh` - Startup scripts

### ❌ Excluded Files (via .gitignore)

**Build Artifacts:**
- `__pycache__/` - Python bytecode
- `build/` - Flutter build output
- `dist/` - Distribution files
- `*.pyc` - Compiled Python files

**Environment:**
- `venv/` - Virtual environments
- `.env` - Environment variables
- `*.env` - Any environment files

**IDE:**
- `.idea/` - IntelliJ/Android Studio
- `.vscode/` - VS Code (optional)
- `*.iml` - IntelliJ module files

**User Content:**
- `assets/sounds/*.wav` - Sound files (user-provided)
- Local configuration files

## Pre-Push Checklist

Before pushing to remote:

- [ ] **No secrets committed** - Verify no API keys, passwords, or tokens
- [ ] **No build artifacts** - Check `__pycache__/`, `build/`, `dist/` are ignored
- [ ] **Documentation complete** - All `.md` files are included
- [ ] **Requirements files** - `requirements.txt` and `pubspec.yaml` are included
- [ ] **Source code complete** - All `.py` and `.dart` files are included
- [ ] **Test files included** - Test utilities and test files
- [ ] **License (optional)** - Add LICENSE file if needed

## Verify Repository Size

```bash
# Check repository size
git count-objects -vH

# Should be reasonably small (< 10MB for source code only)
```

## Common Issues

### Issue: "Repository is too large"

**Solution:** Ensure build artifacts are excluded:
```bash
# Check if large files are tracked
git ls-files | xargs du -sh | sort -h | tail -20

# Remove from git cache if needed (then re-add to .gitignore)
git rm -r --cached build/
git rm -r --cached __pycache__/
git commit -m "Remove build artifacts"
```

### Issue: "API keys in code"

**Solution:** The project uses public APIs only. No API keys are required for market data access. If you've added any keys, remove them before committing.

### Issue: "Binary files too large"

**Solution:** Sound files are excluded. Only source code and documentation are committed.

## Recommended Git Ignore Status

```bash
# Verify .gitignore is working
git status --ignored

# Should see ignored directories like:
# __pycache__/
# venv/
# build/
# .idea/
# etc.
```

## After First Push

### Verify on Remote

1. Check repository on GitHub/GitLab
2. Verify all files are present
3. Check file sizes are reasonable
4. Verify README.md renders correctly

### Clone Test (Optional)

Test that repository can be cloned:

```bash
# From a different directory
git clone https://github.com/YOUR_USERNAME/arbhunter.git arbhunter-test
cd arbhunter-test

# Verify structure
ls -la
cd backend && python -m py_compile main.py
cd ../frontend && flutter pub get
```

## Branch Strategy (Optional)

For future development:

```bash
# Create development branch
git checkout -b develop

# Create feature branch
git checkout -b feature/new-feature

# Push feature branch
git push -u origin feature/new-feature
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add new exchange support
fix: Fix WebSocket connection handling
docs: Update README with new instructions
refactor: Improve arbitrage calculation
test: Add connection test utility
```

## Quick Commands Reference

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# View commit history
git log --oneline

# Check remote
git remote -v
```

---

**Ready to push!** Follow the steps above to set up your git repository and push the ArbHunter project.
