#!/usr/bin/env node
import * as program from 'commander';
import * as path from 'path';
import {Wetland, Migrator} from '../src/index';
const Table  = require('cli-table');
const colors = require('colors/safe');

const checkmark = process.platform === 'win32' ? '\u221A' : '✓';
const cross     = process.platform === 'win32' ? '\u00D7' : '✖';

program.version(require(__dirname + '/../../package.json').version)
  .option('-c, --config <path>', 'defaults to $PWD/(wetland.js|wetland.json)')
  .option('-r, --run', 'run the migration(s) on the database')
  .option('-d, --dump-sql', 'dump the queries for the migration(s)')
  .usage('<command> [options]');

function logExamples() {
  console.log('  Examples:');
  console.log('');
  console.log('    $ wetland migrator:create create_user');
  console.log('    $ wetland migrator:up --run');
  console.log('    $ wetland migrator:down --dump-sql');
  console.log('    $ wetland migrator:status');
  console.log('');
}

function showUnknown(command?: string) {
  if (command) {
    console.log(colors.red(`\n  Unknown command '${command}'.`));
  } else {
    console.log(colors.red(`\n  No command provided.`));
  }
  program.outputHelp();
  logExamples();
}

function getMigrator(provided: string): Migrator {
  let wetland;

  try {
    wetland = new Wetland(getConfig(provided));
  } catch (error) {
    console.error(`\n  Caught: ${error}\n`);

    process.exit(1);
  }

  return wetland.getMigrator();
}

function getConfig(provided: string): Object {
  let tryPaths = [];
  let config   = null;

  if (!provided) {
    tryPaths = [
      path.join(process.cwd(), 'wetland.js'),
      path.join(process.cwd(), 'wetland.json')
    ];
  } else {
    tryPaths.push(provided[0] === '/' ? provided : path.join(process.cwd(), provided));
  }

  tryPaths.find(tryPath => {
    try {
      return config = require(tryPath);
    } catch (e) {
    }
  });

  if (!config) {
    console.error('\n  error: config file not found.\n');
    process.exit(1);
  }

  return config;
}

function migrate(options, method) {
  let migrator = getMigrator(options.parent.config);

  if (options.parent.dumpSql) {
    return migrator[method](Migrator.ACTION_GET_SQL).then(queries => {
      if (!queries) {
        console.log('\n-- No queries found\n');
      } else {
        console.log('\n-- Queries for next migration');
        console.log(queries, '\n');
      }
      process.exit(0);
    }).catch(error => {
      console.error(`\n  Caught: ${error}\n`);
      process.exit(1);
    });
  }

  if (options.parent.run) {
    return migrator[method](Migrator.ACTION_RUN).then(migrations => {
      if (!migrations) {
        console.log('\n Success: No migrations to run.\n');
      } else {
        console.log(`\n  Success: '${parseInt(migrations)}' migrations executed.\n`);
      }

      process.exit(0);
    }).catch(error => {
      console.error(`\n  Caught: ${error}\n`);

      process.exit(1);
    });
  }

  console.error('\n  Error: Missing action. Provide one of --run or --dump-sql\n');

  process.exit(1);
}

program.command('migrator:create <name>').action((name, options) => {
  let migrator = getMigrator(options.parent.config);

  migrator.create(name).then(createdPath => {
    console.log('\n  Success: Migration file created successfully at ' + createdPath + '\n');
    process.exit();
  }).catch(error => {
    console.error(`\n  Caught: ${error}\n`);
    process.exit(1);
  });
});

program.command('migrator:status').action(options => {
  let migrator = getMigrator(options.parent.config);
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
        applied ? applied.migration_time : 'N/A',
        applied ? applied.run : 'N/A',
        applied ? `${colors.green(checkmark)} Applied` : `${colors.red(cross)} Not applied`
      ]);
    });

    console.log('\n');
    console.log(table.toString());
    console.log('\n');
    process.exit();
  }).catch(error => {
    console.error(`\n  Caught: ${error}\n`);
    process.exit(1);
  });
});

program.command('migrator:up').action(options => migrate(options, 'up'));
program.command('migrator:down').action(options => migrate(options, 'down'));
program.command('migrator:latest').action(options => migrate(options, 'latest'));
program.command('migrator:revert').action(options => migrate(options, 'revert'));

if (!process.argv.slice(2).length) {
  showUnknown();
}

program.on('*', command => {
  showUnknown(command);
});

program.on('--help', logExamples);

program.parse(process.argv);
