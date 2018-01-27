import {Wetland} from '../../src/Wetland';
import {Schema} from '../resource/Schema';
import * as path from 'path';
import {tmpTestDir, fixturesDir, getType, User, Pet, Post, rmDataDir} from '../resource/Seeder';

describe('Cleaner', () => {
  beforeEach(() => rmDataDir());

  describe('.clean() : database', () => {
    before((done) => {
      Schema.resetDatabase(done);
    });

    it('Should clean the database correctly and be able to do the migration', () => {
      const bypassLifecyclehooks = false;

      const wetland = new Wetland({
        dataDirectory: `${tmpTestDir}/.data`,
        stores: {
          defaultStore: {
            client: 'mysql',
            connection: {
              database: 'wetland_test',
              user: 'root',
              password: ''
            }
          }
        },
        seed: {
          fixturesDirectory: path.join(fixturesDir, getType(bypassLifecyclehooks)),
          clean: true,
          bypassLifecyclehooks
        },
        entities: [User, Pet, Post]
      });

      const seeder   = wetland.getSeeder();
      const cleaner  = wetland.getCleaner();
      const migrator = wetland.getMigrator();

      return migrator.devMigrations(false)
        .then(() => seeder.seed())
        .then(() => cleaner.clean())
        .then(() => migrator.devMigrations(false))
        .then(() => seeder.seed());
    });
  });

  describe('.clean() : embedded database', () => {
    it('Should clean the database correctly and be able to do the migration', () => {
      const bypassLifecyclehooks = false;

      const wetland = new Wetland({
        dataDirectory: `${tmpTestDir}/.data`,
        stores: {
          defaultStore: {
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
              filename: `${tmpTestDir}/cleaner.sqlite`
            }
          }
        },
        seed: {
          fixturesDirectory: path.join(fixturesDir, getType(bypassLifecyclehooks)),
          clean: true,
          bypassLifecyclehooks
        },
        entities: [User, Pet, Post]
      });

      const seeder   = wetland.getSeeder();
      const cleaner  = wetland.getCleaner();
      const migrator = wetland.getMigrator();

      return migrator.devMigrations(false)
        .then(() => seeder.seed())
        .then(() => cleaner.clean())
        .then(() => migrator.devMigrations(false))
        .then(() => seeder.seed());
    });
  });
});
