/* eslint-disable import/no-extraneous-dependencies */
import retry from 'async-retry'
import chalk from 'chalk'
import cpy from 'cpy'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  downloadAndExtractExample,
  downloadAndExtractRepo,
  getRepoInfo,
  hasExample,
  hasRepo,
  RepoInfo
} from './helpers/examples'
import { makeDir } from './helpers/make-dir'
import { tryGitInit } from './helpers/git'
import { install } from './helpers/install'
import { isFolderEmpty } from './helpers/is-folder-empty'
import { getOnline } from './helpers/is-online'
import { shouldUseYarn } from './helpers/should-use-yarn'
import { isWriteable } from './helpers/is-writeable'

export class DownloadError extends Error {}

export async function createApp({
  appPath,
  useNpm
}: {
  appPath: string
  useNpm: boolean
}): Promise<void> {
  const root = path.resolve(appPath)

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      'The application path is not writable, please check folder permissions and try again.'
    )
    console.error(
      'It is likely you do not have write permissions for this folder.'
    )
    process.exit(1)
  }

  const appName = path.basename(root)
  const originalDirectory = process.cwd()

  await makeDir(root)
  if (!isFolderEmpty(root, appName)) {
    process.exit(1)
  }

  const useYarn = useNpm ? false : shouldUseYarn()
  const isOnline = !useYarn || (await getOnline())

  const displayedCommand = useYarn ? 'yarn' : 'npm'
  console.log(`Creating a new Next.js app in ${chalk.green(root)}.`)
  console.log()

  await makeDir(root)
  process.chdir(root)

  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' }
  }
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  )

  console.log(
    `Installing ${chalk.cyan('react')}, ${chalk.cyan(
      'react-dom'
    )}, and ${chalk.cyan('next')} using ${displayedCommand}...`
  )
  console.log()

  await install(root, ['react', 'react-dom', 'next'], { useYarn, isOnline })
  console.log()

  console.log(
    `Installing ${chalk.cyan('chakra-ui')} using ${displayedCommand}...`
  )
  console.log()
  await install(
    root,
    ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
    { useYarn, isOnline }
  )
  console.log()

  console.log(
    `Installing ${chalk.cyan('react-icons')} using ${displayedCommand}...`
  )
  console.log()
  await install(root, ['react-icons'], { useYarn, isOnline })
  console.log()

  console.log(
    `Installing ${chalk.cyan('@testing-library')} using ${displayedCommand}...`
  )
  console.log()
  await install(
    root,
    [
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event'
    ],
    { useYarn, isOnline }
  )
  console.log()

  console.log(
    `Installing ${chalk.cyan('typescript')} using ${displayedCommand}...`
  )
  console.log()
  await install(
    root,
    [
      'typescript',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@types/jest'
    ],
    { useYarn, isOnline }
  )

  await cpy('**', root, {
    parents: true,
    cwd: path.join(__dirname, 'templates', 'default'),
    rename: (name) => {
      switch (name) {
        case 'gitignore': {
          return '.'.concat(name)
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/zeit/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case 'README-template.md': {
          return 'README.md'
        }
        default: {
          return name
        }
      }
    }
  })

  if (tryGitInit(root)) {
    console.log('Initialized a git repository.')
    console.log()
  }

  let cdpath: string
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName
  } else {
    cdpath = appPath
  }

  console.log(`${chalk.green('Success!')} Created ${appName} at ${appPath}`)
  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}dev`))
  console.log('    Starts the development server.')
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`))
  console.log('    Builds the app for production.')
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} start`))
  console.log('    Runs the built app in production mode.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(chalk.cyan('  cd'), cdpath)
  console.log(
    `  ${chalk.cyan(`${displayedCommand} ${useYarn ? '' : 'run '}dev`)}`
  )
  console.log()
}
