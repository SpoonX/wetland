import {assert} from 'chai';
import * as Promise from 'bluebird';
import {Wetland} from '../../src/Wetland';
import {SchemaBuilder} from '../../src/SchemaBuilder';
import {Store} from '../../src/Store';
import {Schema} from '../resource/Schema';
import {schemas} from '../resource/schemas';

describe('SchemaBuilder', () => {
  beforeEach(done => {
    Schema.resetDatabase(done);
  });

  describe('.create()', () => {
    it('should create my tables (todo)', done => testEntities('todo', done));
    it('should create my tables (transformtodo)', done => testEntities('transformtodo', done));
    it('should create my tables (postal)', done => testEntities('postal', done));
  });
});

function testEntities(section, done) {
  let wetland = new Wetland({
    entityPath: __dirname + '/../resource/entity/' + section,
    stores    : {
      defaultStore: {
        client    : 'mysql',
        connection: {
          user    : 'root',
          host    : '127.0.0.1',
          database: 'wetland_test'
        }
      }
    }
  });

  let connection = wetland.getStore().getConnection(Store.ROLE_MASTER);

  wetland.getSchemaManager().create().then(() => {
    return testProperty(connection, section, 'columns', 'columns')
      .then(() => testProperty(connection, section, 'constraints', 'key_column_usage'))
      .then(() => testProperty(connection, section, 'referentialConstraints', 'referential_constraints'))
      .then(() => done())
      .catch(done);
  });
}

function testProperty(connection, section, property, table) {
  return Promise.all(schemas[section][property].map(target => {
    return connection
      .from('information_schema.' + table)
      .where(target)
      .where(property === 'columns' ? 'table_schema' : 'constraint_schema', '=', 'wetland_test')
      .then(result => assert.lengthOf(result, 1, `'${section}' broken with ${JSON.stringify(target)}`))
  }));
}
