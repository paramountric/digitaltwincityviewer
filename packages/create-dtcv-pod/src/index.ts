#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
// import Commander from 'commander';
// import path from 'path';
// import prompts from 'prompts';

async function run(): Promise<void> {
  console.log('execute build data');
}

run().catch(async reason => {
  console.log(`  ${chalk.cyan(reason.command)} has failed.`);
  process.exit(1);
});
