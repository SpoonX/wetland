import { assert } from 'chai';
import { migrations } from '../../resource/migrations';
import { Wetland } from '../../../src/Wetland';
import { Migrator } from '../../../src/Migrator/Migrator';
import { Schema } from '../../resource/Schema';

let getWetland = () => {
  return new Wetland({
    migrator: { directory: __dirname + '/../../resource/migrations' },
    stores  : {
      defaultStore: {
        client    : 'mysql',
        connection: { user: 'root', host: '127.0.0.1', database: 'wetland_test' },
      },
    },
  });
};

describe('Migrator', () => {
  beforeEach(done => {
    Schema.resetDatabase(done);
  });

  describe('.up()', () => {
    it('should run with action run', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.up(Migrator.ACTION_RUN)
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('ticket', 'name').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('ticket', 'id').then(assert.isTrue))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'id').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'name').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'deadly_skill').then(assert.isTrue))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('user').then(assert.isTrue))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .then(() => done())
        .catch(done);
    });

    it('should run and return the queries with action get_sql', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.up(Migrator.ACTION_GET_SQL)
        .tap(query => assert.equal(query, migrations.up.baz))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .then(() => migrator.up(Migrator.ACTION_GET_SQL))
        .tap(query => assert.equal(query, migrations.up.foo))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .then(() => migrator.up(Migrator.ACTION_GET_SQL))
        .tap(query => assert.equal(query, migrations.up.bar))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .then(() => done())
        .catch(done);
    });
  });

  describe('.down()', () => {
    it('should run with action run', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.latest(Migrator.ACTION_RUN)
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .then(() => done())
        .catch(done);
    });

    it('should run and return the queries with action get_sql', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.latest(Migrator.ACTION_RUN)
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isTrue))
        .then(() => migrator.down(Migrator.ACTION_GET_SQL))
        .tap(query => assert.equal(query, migrations.down.bar))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isTrue))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => migrator.down(Migrator.ACTION_GET_SQL))
        .tap(query => assert.equal(query, migrations.down.foo))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .then(() => migrator.down(Migrator.ACTION_GET_SQL))
        .tap(query => assert.equal(query, migrations.down.baz))
        .then(() => migrator.down(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => done())
        .catch(done);
    });
  });

  describe('.latest()', () => {
    it('should run with action run', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.latest(Migrator.ACTION_RUN)
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('ticket', 'name').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('ticket', 'id').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'id').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'name').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'deadly_skill').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isTrue))
        .then(() => migrator.revert(Migrator.ACTION_RUN))
        .then(() => done())
        .catch(done);
    });

    it('should run and return the queries with action get_sql', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.latest(Migrator.ACTION_GET_SQL)
        .tap(query => assert.equal(query, migrations.latest))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .then(() => done())
        .catch(done);
    });
  });

  describe('.revert()', () => {
    it('should run with action run', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.latest(Migrator.ACTION_RUN)
        .then(() => migrator.revert(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .then(() => migrator.revert(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .then(() => migrator.up(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'id').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'name').then(assert.isTrue))
        .tap(() => connection.schema.hasColumn('robot', 'deadly_skill').then(assert.isTrue))
        .then(() => migrator.revert(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('user').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('person').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('animal').then(assert.isFalse))
        .tap(() => connection.schema.hasTable('robot').then(assert.isFalse))
        .then(() => migrator.revert(Migrator.ACTION_RUN))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isFalse))
        .then(() => done())
        .catch(done);
    });

    it('should run and return the queries with action get_sql', done => {
      let wetland    = getWetland();
      let migrator   = wetland.getMigrator();
      let connection = migrator.getConnection();

      migrator.latest(Migrator.ACTION_RUN)
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isTrue))
        .then(() => migrator.revert(Migrator.ACTION_GET_SQL))
        .tap(query => assert.equal(query, migrations.revert))
        .tap(() => connection.schema.hasTable('ticket').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('person').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('animal').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('robot').then(assert.isTrue))
        .tap(() => connection.schema.hasTable('user').then(assert.isTrue))
        .then(() => migrator.revert(Migrator.ACTION_RUN))
        .then(() => done())
        .catch(done);
    });
  });
});
