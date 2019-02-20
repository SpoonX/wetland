import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as Promise from 'bluebird';
import { MigratorConfigInterface } from './MigratorConfigInterface';

const replace = require('stream-replace');

export class MigrationFile {
  /**
   * @type {MigratorConfigInterface}
   */
  private config: MigratorConfigInterface;

  /**
   * @param {MigratorConfigInterface} config
   */
  public constructor(config: MigratorConfigInterface) {
    this.config = config;

    this.ensureMigrationDirectory();
  }

  /**
   * Get the config.
   *
   * @returns {MigratorConfigInterface}
   */
  public getConfig(): MigratorConfigInterface {
    return this.config;
  }

  /**
   * Create a new migration file.
   *
   * @param {string} name
   * @param {{}}     [code]
   *
   * @returns {Bluebird}
   */
  public create(name: string, code?: { up: string, down: string }): Promise<any> {
    const sourceFile = `${__dirname}/templates/migration.${this.config.extension}.dist`;
    const migrationName = `${this.makeMigrationName(name)}.${this.config.extension}`;
    const targetFile = path.join(this.config.directory, migrationName);
    const readStream = fs.createReadStream(sourceFile);
    const writeStream = fs.createWriteStream(targetFile);
    code = code || { up: null, down: null };

    if (!code.up) {
      code.up = '    // @todo Implement';
    }

    if (!code.down) {
      code.down = '    // @todo Implement';
    }

    return new Promise((resolve, reject) => {
      readStream
        .pipe(replace(/\{\{ up }}/, code.up))
        .pipe(replace(/\{\{ down }}/, code.down))
        .pipe(writeStream);

      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('close', () => resolve(migrationName));
    });
  }

  /**
   * Get all migrations from the directory.
   *
   * @returns {Bluebird<string[]>}
   */
  public getMigrations(): Promise<Array<string>> {
    return Promise.promisify(fs.readdir)(this.config.directory).then(contents => {
      const regexp = new RegExp(`\.${this.config.extension}$`);

      return contents
        .filter(migration => migration.search(regexp) > -1)
        .map(migration => migration.replace(regexp, ''))
        .sort();
    });
  }

  /**
   * Make sure the migration directory exists.
   */
  private ensureMigrationDirectory() {
    try {
      fs.statSync(this.config.directory);
    } catch (error) {
      mkdirp.sync(this.config.directory);
    }
  }

  /**
   * Make migration name.
   *
   * @param {string} name
   *
   * @returns {string}
   */
  private makeMigrationName(name): string {
    const date = new Date();
    const pad = (source) => {
      source = source.toString();

      return source[1] ? source : `0${source}`;
    };

    return date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds()) + `_${name}`;
  }
}
