#!/usr/bin/env node

import * as program from 'commander';
import {
  migrate,
  getMigrator,
  getName,
  getWetland,
  cross,
  checkmark,
  getVersion,
  showSuccess,
  registerHelpHandler,
  bootstrap,
  unexpectedError,
  showError, getSnapshot
} from './helpers';

bootstrap();

const toDatetime = require('to-datetime');
const Table      = require('cli-table');
const colors     = require('colors/safe');

program
  .version(getVersion())
  .option('-c, --config <path>', 'defaults to $PWD/(wetland.js|wetland.json)')
  .option('-r, --run', 'run the migration(s) on the database')
  .option('-d, --dump-sql', 'dump the queries for the migration(s)')
  .option('-b, --bare', 'create an empty migration file');

registerHelpHandler('migrator', [
  'create create_user --bare',
  'status',
  'status -c config/wetland.js',
  'up --run',
  'down --dump-sql',
  'latest -r',
  'undo -d',
]);

program
  .command('create [name]')
  .description('Create a new migration file (name defaults to git branch name).')
  .action((name, options) => {
    let wetland  = getWetland(options);
    let snapshot = wetland.getSnapshotManager();
    let migrator = wetland.getMigrator();
    let schema   = wetland.getSchemaManager();
    let resolvedName;

    getName(name)
      .then(resolved => {
        resolvedName = resolved;

        if (options.parent.bare) {
          return {up: null, down: null};
        }

        return snapshot.fetch(resolvedName, false).then(previous => {
          return Promise.all([
            schema.getCode(previous || {}),
            schema.getCode(previous || {}, true)
          ]).then(code => {
            return {up: code[0], down: code[1]};
          });
        });
      })
      .then(code => migrator.create(resolvedName, code))
      .then(migrationName => showSuccess(`Migration file '${migrationName}' created successfully`))
      .catch(unexpectedError);
  });

program.command('dev').description('Diff against current mapping for dev migrations.').action(options => {
  if (!options.parent.run && !options.parent.dumpSql) {
    showError('Missing flag -d or -r');
  }

  let wetland  = getWetland(options);
  let snapshot = wetland.getSnapshotManager();
  let schema   = wetland.getSchemaManager();

  snapshot.fetch()
    .then(previous => {
      if (options.parent.dumpSql) {
        console.log('\n-- Queries for dev migrations:');
        console.log((schema.getSQL(previous || {}) || '-- Nothing to do.') + '\n');
        process.exit();
      }

      return schema.apply(previous || {});
    })
    .then(() => snapshot.create())
    .then(() => showSuccess('Dev migrations applied'))
    .catch(unexpectedError);
});

program.command('status').description('Overview of migrations and their status.').action(options => {
  let migrator = getMigrator(options);
  let table    = new Table({
    head: [
      colors.green.bold('Migration'),
      colors.green.bold('Run at'),
      colors.green.bold('Run ID'),
      colors.green.bold('Status')
    ]
  });

  Promise.all([migrator.allMigrations(), migrator.appliedMigrations()]).then(result => {
    let runMap = {};

    result[1].forEach(migration => runMap[migration.name] = migration);

    result[0].map(migration => {
      let applied = runMap[migration];

      table.push([
        migration,
        applied ? toDatetime(applied.migration_time) : 'N/A',
        applied ? applied.run : 'N/A',
        applied ? `${colors.green(checkmark)} Applied` : `${colors.red(cross)} Not applied`
      ]);
    });

    console.log('');
    console.log(table.toString());
    console.log('');
    process.exit();
  }).catch(unexpectedError);
});

program.command('schema').description('Create the database schema.').action(options => {
  let schema = getWetland(options).getSchemaManager();

  if (options.parent.dumpSql) {
    console.log('\n-- Queries for schema');
    console.log(schema.getSQL() + '\n');
    process.exit();
  } else if (options.parent.run) {
    return schema.create().then(() => {
      showSuccess('Schema created successfully');
    }).catch(unexpectedError);
  }

  showError('Missing flag -d or -r');
});

program
  .command('revert [name]')
  .description('Revert to snapshot (name defaults to git branch name).')
  .action((name, options) => {
    if (!options.parent.run && !options.parent.dumpSql) {
      showError('Missing flag -d or -r');
    }

    let wetland  = getWetland(options);
    let snapshot = wetland.getSnapshotManager();
    let schema   = wetland.getSchemaManager();
    let resolvedName;

    getName(name)
      .then(resolved => resolvedName = resolved)
      .then(resolved => snapshot.fetch(resolved, false))
      .then(resolved => {
        if (options.parent.run) {
          return schema.apply(resolved, true).then(() => snapshot.create());
        }

        return schema.getSQL(resolved, true);
      })
      .then(sql => {
        if (options.parent.run) {
          showSuccess(`Successfully reverted to '${resolvedName}'`)
        }

        console.log('\n-- Queries for revert');
        console.log(sql + '\n');
        process.exit();
      })
      .catch(unexpectedError);
  });

program.command('forward').description('Update the dev snapshot without running.').action(options => {
  getSnapshot(options).create()
    .then(() => showSuccess(`Dev snapshot created`))
    .catch(unexpectedError);
});

program.command('up').description('Run the next "up" migration.').action(options => migrate(options, 'up'));
program.command('down').description('Run the latest "down" migration.').action(options => migrate(options, 'down'));
program.command('latest').description('Run all un-run "up" migrations.').action(options => migrate(options, 'latest'));
program.command('undo').description('Undo the last run migration(s).').action(options => migrate(options, 'revert'));

program.parse(process.argv);
