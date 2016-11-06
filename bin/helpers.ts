import {Wetland, Migrator} from '../src/index';
import * as program from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import {exec} from 'child_process';
import {SnapshotManager} from '../src/SnapshotManager';
const colors = require('colors/safe');

export let checkmark = process.platform === 'win32' ? '\u221A' : '✓';
export let cross     = process.platform === 'win32' ? '\u00D7' : '✖';

export function logExamples(command, examples) {
  console.log('  Examples:');
  console.log('');
  examples.forEach(example => console.log(`    $ wetland ${command} ${example}`));
  console.log('');
}

export function getVersion() {
  return require(__dirname + '/../../package.json').version;
}

export function showSuccess(message: string, exit: boolean = true) {
  console.log(colors.green(`\n  Success: ${message}!\n`));

  if (exit) {
    process.exit();
  }
}

export function unexpectedError(error) {
  showError('Unexpected error', error);
}

export function showError(message: string, error?: any, exit: boolean = true) {
  console.log(colors.red(`\n  Error: ${message}!\n`));

  if (error) {
    console.log(error);
  }

  if (exit) {
    process.exit(1);
  }
}

export function getWetland(options): Wetland {
  let wetland;

  try {
    wetland = new Wetland(getConfig(options && options.parent ? options.parent.config : null));
  } catch (error) {
    console.error(`\n  Caught: ${error}\n`);

    process.exit(1);
  }

  return wetland;
}

export function getMigrator(provided: string): Migrator {
  return getWetland(provided).getMigrator();
}

export function getSnapshot(provided: string): SnapshotManager {
  return getWetland(provided).getSnapshotManager();
}

export function getConfig(provided: string): Object {
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

export function getName(name): Promise<string> {
  return new Promise((resolve, reject) => {
    if (name) {
      return resolve(name.replace(/\W+/g, "_"));
    }

    try {
      fs.statSync(path.resolve(process.cwd(), '.git'));
    } catch (error) {
      showError(`No name provided, and no git repository found in cwd.`);
    }

    exec('git symbolic-ref --short HEAD', (error, stdout) => {
      if (error) {
        return reject(error);
      }

      let branchName = stdout.trim();

      resolve(branchName.replace(/\W+/g, "_"));
    });
  });
}

export function migrate(options, method) {
  let migrator = getMigrator(options);

  if (options && options.parent.dumpSql) {
    return migrator[method](Migrator.ACTION_GET_SQL).then(queries => {
      if (!queries) {
        console.log('\n-- No queries found\n');
      } else {
        console.log('\n-- Queries for next migration');
        console.log(queries, '\n');
      }
      process.exit(0);
    }).catch(unexpectedError);
  }

  if (options && options.parent.run) {
    return migrator[method](Migrator.ACTION_RUN).then(migrations => {
      if (!migrations) {
        showSuccess('Success: No migrations to run');
      } else {
        showSuccess(`'${parseInt(migrations)}' migrations executed!`);
      }

      process.exit(0);
    }).catch(unexpectedError);
  }

  showError('Missing action. Provide one of --run or --dump-sql');
}

export function bootstrap() {
  try {
    require(process.cwd() + '/package.json');
  } catch (error) {
    showError('Unable to locate package.json, refusing to run. Please use wetland from your project root.');
  }

  require('app-module-path').addPath(path.resolve(process.cwd(), 'node_modules'));
}

export function registerHelpHandler(command?, examples?) {
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    if (command && examples) {
      logExamples(command, examples);
    }
  }

  program.on('*', command => {
    program.outputHelp();
    if (command && examples) {
      logExamples(command, examples);
    }
  });

  program.on('--help', () => {
    if (command && examples) {
      logExamples(command, examples);
    }
  });
}
