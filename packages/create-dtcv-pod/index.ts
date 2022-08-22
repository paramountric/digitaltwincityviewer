#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import prompts from 'prompts';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
let fileDirectory = '.';
const program = new Command();

program
  .name(packageJson.name)
  .version(packageJson.version)
  .usage(`${chalk.green('create-dtcv-app')} [options]`)
  .option(
    '-d, --directory <dir>',
    `
    Use relative path to file directory. Defaults to current directory.
    `,
    '.'
  )
  .option(
    '-u, --url <url>',
    `
    Verified URL for publishing the output.
    `
  )
  .option(
    '--static',
    `
    Create static files to put at the given URL.
    `
  )
  .action(opts => {
    console.log('todo: setup options execution paths', opts);
    if (opts.d) {
      fileDirectory = opts.d;
    }
  })
  .parse(process.argv);

async function run(): Promise<void> {
  if (!fileDirectory) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'What is the relative path to the file directory?',
      initial: '.',
      validate: name => {
        fileDirectory = path.basename(path.resolve(name));
        if (fileDirectory) {
          return true;
        }
        return 'Invalid or missing file directory: ' + fileDirectory;
      },
    });

    if (typeof res.path === 'string') {
      fileDirectory = res.path.trim();
    }
    console.log(fileDirectory);
  }
  console.log(
    '\nThis is the given name and directory:\n' +
      `  ${chalk.cyan(program.name())} ${chalk.green(fileDirectory)}\n`
  );
}

run().catch(async reason => {
  console.log(`  ${chalk.cyan(reason.command)} has failed.`);
  process.exit(1);
});
