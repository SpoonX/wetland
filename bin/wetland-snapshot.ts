#!/usr/bin/env node

import * as program from 'commander';
import {
  getVersion,
  showSuccess,
  registerHelpHandler,
  bootstrap,
  unexpectedError,
  getName,
  getSnapshot
} from './helpers';

bootstrap();

program
  .version(getVersion())
  .option('-c, --config <path>', 'defaults to $PWD/(wetland.js|wetland.json)');

registerHelpHandler('snapshot', [
  'create # branch name',
  'create authentication # project name',
  'remove authentication # done with project, migrations generated'
]);

program
  .command('create [name]')
  .description('Create a new snapshot (name defaults to git branch name).')
  .action((name, options) => {
    let createdName = name;

    getName(name)
      .then(name => createdName = name)
      .then(name => getSnapshot(options).create(name as string, false))
      .then(() => {
        showSuccess(`Snapshot '${createdName}' created successfully`);
      }).catch(unexpectedError);
  });

program
  .command('remove [name]')
  .description('Remove an existing snapshot (name defaults to git branch name).')
  .action((name, options) => {
    let removedName = name;

    getName(name)
      .then(name => removedName = name)
      .then(name => getSnapshot(options).remove(name as string, false))
      .then(() => showSuccess(`Snapshot '${removedName}' removed successfully`))
      .catch(unexpectedError);
  });

program.parse(process.argv);
