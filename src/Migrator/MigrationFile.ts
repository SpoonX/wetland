import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';
import {MigratorConfigInterface} from './MigratorConfigInterface';

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
   *
   * @returns {Bluebird}
   */
  public create(name: string): Promise<any> {
    let sourceFile  = `${__dirname}/templates/migration.${this.config.extension}.js`;
    let targetFile  = path.join(this.config.directory, `${this.makeMigrationName(name)}.${this.config.extension}`);
    let readStream  = fs.createReadStream(sourceFile);
    let writeStream = fs.createWriteStream(targetFile);

    readStream.pipe(writeStream);

    return new Promise((resolve, reject) => {
      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('close', () => resolve());
    });
  }

  /**
   * Get all migrations from the directory.
   *
   * @returns {Bluebird<string[]>}
   */
  public getMigrations(): Promise<Array<string>> {
    return Promise.promisify(fs.readdir)(this.config.directory).then(contents => {
      let regexp = new RegExp(`\.${this.config.extension}$`);

      return contents
        .filter(migration => migration.search(regexp) > -1)
        .map(migration => migration.replace(regexp, ''));
    });
  }

  /**
   * Make migration name.
   *
   * @param {string} name
   *
   * @returns {string}
   */
  private makeMigrationName(name): string {
    let date = new Date();
    let pad  = (source) => {
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
