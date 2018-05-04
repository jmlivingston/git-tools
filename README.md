# git-tools

## Summary

Simple commands for more complex git processes.

## 1. Remove commit history

### Command

```js
node ./git-tools.js --command='remove-commit-history' --repo-dir='/Projects/git-migrate-test' --branch=master
```

### Underlying Code

```bash
cd <REPO_DIR>
git checkout <BRANCH>
git checkout --orphan <TEMP_BRANCH>
git add -A
git commit -am “initial commit“
git branch -D <BRANCH>
git branch -m <BRANCH>
git push -f origin <BRANCH>
git branch --set-upstream-to=origin/<BRANCH>
```

## 2. Migrate subdirectory with commit history

### Command

```js
node ./git-tools.js --command='clone-subdir' --source-repo-dir='/Projects/react-bootstrap-training' --target-repo-dir='/Projects/git-migrate-test' --target-repo-url='https://github.com/jmlivingston/git-migrate-test.git' --source-branch=master --target-branch=master --sub-directory=public
```

### Underlying Code

```bash
rm -rf <TARGET_REPO_DIR>
mkdir <TARGET_REPO_DIR>
cd <SOURCE_REPO_DIR>
git checkout <SOURCE_BRANCH>
git pull
git subtree split -P <SUB_DIRECTORY> -b <TEMP_BRANCH>
cd <TARGET_REPO_DIR>
git init
git remote add origin <TARGET_REPO_URL>
git pull ../<SOURCE_REPO_DIR> <TEMP_BRANCH> --force --alow-unrelated-histories
git push origin -u -f <TARGET_BRANCH>
```
