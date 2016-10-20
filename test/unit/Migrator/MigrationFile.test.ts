import {expect, assert} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {MigrationFile} from '../../../src/Migrator/MigrationFile';

let migrationsDir  = __dirname + '/../../resource/migrations';
let tmpMigrations  = path.join(migrationsDir, 'tmp');
let cleanDirectory = directory => {
  try {
    fs.readdirSync(directory).forEach(file => {
      fs.unlinkSync(path.join(directory, file));
    });
    fs.rmdirSync(directory);
  } catch (e) {
  }
};

describe('MigrationFile', () => {
  describe('.constructor()', () => {
    it('should set the config', () => {
      let config        = {extension: 'js', tableName: 'wetland_migrations', directory: tmpMigrations};
      let migrationFile = new MigrationFile(config);

      assert.deepEqual(migrationFile.getConfig(), config);
    });
  });

  describe('.getConfig()', () => {
    it('should get the config', () => {
      let config        = {directory: ''};
      let migrationFile = new MigrationFile(config);

      assert.deepEqual(migrationFile.getConfig(), config);
    });
  });

  describe('.create()', () => {
    before(() => {
      cleanDirectory(tmpMigrations);
      fs.mkdirSync(tmpMigrations);
    });

    after(() => {
      cleanDirectory(tmpMigrations);
    });

    it('should create a new migration file', done => {
      let migrationFile = new MigrationFile({
        extension: 'js',
        tableName: 'wetland_migrations',
        directory: tmpMigrations
      });

      migrationFile.create('created').then(() => {
        let migrations = fs.readdirSync(tmpMigrations);
        let migration  = require(tmpMigrations + '/' + migrations[0])['Migration'];

        assert.isTrue(Reflect.has(migration, 'up'));
        assert.isTrue(Reflect.has(migration, 'down'));
        assert.match(migrations[0], /^\d{14}_created\.js$/);
        assert.equal(migrations.length, 1);

        done();
      });
    });

    it('should complain about an invalid write path', done => {
      let migrationFile = new MigrationFile({
        extension: 'js',
        tableName: 'wetland_migrations',
        directory: tmpMigrations
      });

      migrationFile.create('foo/created').catch(error => {
        assert.equal(error.code, 'ENOENT');

        done();
      });
    });

    it('should complain about an invalid read path', done => {
      let migrationFile = new MigrationFile({
        extension: 'js',
        tableName: 'wetland_migrations',
        directory: tmpMigrations + '/ooooops'
      });

      migrationFile.create('foo/created').catch(error => {
        assert.equal(error.code, 'ENOENT');

        done();
      });
    });
  });

  describe('.getMigrations()', () => {
    it('Should give me the names of all available migrations', done => {
      let migrationFile = new MigrationFile({
        extension: 'js',
        tableName: 'wetland_migrations',
        directory: __dirname + '/../../resource/migrations'
      });

      migrationFile.getMigrations().then(files => {
        expect(files).to.have.same.members([
          '20161004123412_foo',
          '20161004123413_bar',
          '20161004123411_baz'
        ]);

        done();
      }).catch(done);
    });
  });
});
