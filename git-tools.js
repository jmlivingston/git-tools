const argv = require('yargs').argv
const fs = require('fs')
const path = require('path')
const prompt = require('prompt')
const rimraf = require('rimraf')
const shell = require('shelljs')

const runGitCommands = (commands, index) => {
  if (!shell.which('git')) {
    shell.echo('Error: script requires git')
    shell.exit(1)
  } else {
    index = index || 0
    if (index < commands.length) {
      let command = commands[index]
      // HACK: If cd, then use shell.cd
      if (command.indexOf('cd ') !== -1) {
        shell.cd(command.split(' ').pop())
        runGitCommands(commands, index + 1)
      } else {
        shell.echo(command)
        shell.exec(command, (code, stdout, stderr) => {
          if (code === 0) {
            runGitCommands(commands, index + 1)
          } else {
            shell.echo('Error: Git command "' + command + '" failed.')
            shell.echo(stderr)
            shell.exit(1)
          }
        })
      }
    }
  }
}

shell.echo(argv.command)

switch (argv.command) {
  case 'remove-commit-history':
    prompt.start()
    prompt.get(
      {
        properties: {
          continue: {
            message: 'This will delete all commit history for' + argv.repoDir + '. Continue? Type "yes" or "no"'
          }
        }
      },
      (err, result) => {
        if (result.continue.toLowerCase().indexOf('y') !== -1) {
          if (argv.repoDir && argv.branch) {
            if (fs.existsSync(argv.repoDir)) {
              if (fs.existsSync(path.join(argv.repoDir, '.git'))) {
                shell.cd(argv.repoDir)
                const tempBranch = 'latest-' + Math.round(new Date().getTime() / 1000)
                const gitCommands = [
                  'git checkout ' + argv.branch,
                  'git checkout --orphan ' + tempBranch,
                  'git add -A',
                  "git commit -am 'initial commit'",
                  'git branch -D ' + argv.branch,
                  'git branch -m ' + argv.branch,
                  'git push -f origin ' + argv.branch,
                  'git branch --set-upstream-to=origin/' + argv.branch
                ]
                runGitCommands(gitCommands)
              } else {
                shell.echo(argv.repoDir + ' does not contain a Git repo.')
              }
            } else {
              shell.echo(argv.repoDir + ' directory does not exist.')
            }
          } else {
            shell.echo('Error: Must specify --repo-dir and --branch')
          }
        }
      }
    )
    break
  case 'clone-subdir':
    prompt.start()
    prompt.get(
      {
        properties: {
          continue: {
            message: 'This will delete ' + argv.targetRepoDir + '. Continue? Type "yes" or "no"'
          }
        }
      },
      (err, result) => {
        if (result.continue.toLowerCase().indexOf('y') !== -1) {
          if (
            argv.sourceRepoDir &&
            argv.targetRepoDir &&
            argv.targetRepoUrl &&
            argv.sourceBranch &&
            argv.targetBranch &&
            argv.subDirectory
          ) {
            if (fs.existsSync(argv.sourceRepoDir)) {
              if (fs.existsSync(path.join(argv.sourceRepoDir, '.git'))) {
                shell.cd(argv.sourceRepoDir)
                rimraf.sync(argv.targetRepoDir)
                fs.mkdirSync(argv.targetRepoDir)
                const tempBranch = argv.targetRepoDir.split('/').pop()
                let gitCommands = [
                  'git checkout ' + argv.sourceBranch,
                  'git pull',
                  'git subtree split -P ' + argv.subDirectory + ' -b ' + tempBranch,
                  'cd ' + argv.targetRepoDir,
                  'git init',
                  'git remote add origin ' + argv.targetRepoUrl,
                  'git pull ' + argv.sourceRepoDir + ' ' + tempBranch + ' --force --allow-unrelated-histories',
                  'git push origin -u -f ' + argv.targetBranch
                ]
                runGitCommands(gitCommands)
              } else {
                shell.echo(argv.sourceRepoDir + ' does not contain a Git repo.')
              }
            } else {
              shell.echo(argv.sourceRepoDir + ' directory does not exist.')
            }
          } else {
            shell.echo(
              'Error: Must specify --source-repo-dir, --target-repo-dir, --target-repo-url, --source-branch, --target-branch, and --sub-directory'
            )
          }
        }
      }
    )
    break
  default:
    shell.echo('Missing --command parameter. Valid values are remove-commit-history and clone-subdir')
    break
}
