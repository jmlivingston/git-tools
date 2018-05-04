# README

## Migrate subdirectory with commit history

### Command

```js
node ./git-tools.js --command='clone-subdir' --source-repo-dir='/Projects/react-bootstrap-training' --target-repo-dir='/Projects/git-migrate-test' --target-repo-url='https://github.com/jmlivingston/git-migrate-test.git' --source-branch=master --target-branch=master --sub-directory=public
```

### Underlying Code

sourceRepoDir - react-bootstrap-training
targetRepoDir - git-migrate-test
targetRepoUrl - https://github.com/jmlivingston/git-migrate-test.git

cd <sourceRepoDir>
git subtree split -P public -b <targetRepoDir>
cd ..
mkdir <targetRepoDir>
cd <targetRepoDir>
git init
git remote add origin <targetRepoUrl>
git pull ../<sourceRepoDir> <targetRepoDir>
git push origin -u master

## Remove commit history

### Command

```js
node ./git-tools.js --command='remove-commit-history' --repo-dir='/Projects/git-migrate-test' --branch=master
```

### Underlying Code

branch
repoDir

cd <repoDir>
git checkout <branch>
git checkout --orphan latest_branch
git add -A
git commit -am “initial commit“
git branch -D <branch>
git branch -m <branch>
git push -f origin <branch>
