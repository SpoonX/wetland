import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {SchemaBuilder} from '../../src/SchemaBuilder';
import {Store} from '../../src/Store';
import {Schema} from '../resource/Schema';
import {schemas} from '../resource/schemas';
import * as util from 'util';

describe('SchemaBuilder', () => {
  beforeEach(done => {
    Schema.resetDatabase(done);
  });

  describe('.create()', () => {
    it('should create my tables (todo)', (done) => {
      let wetland = new Wetland({
        entityPath: __dirname + '/../resource/entity/todo',
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

      new SchemaBuilder(wetland.getManager()).create().apply().then(() => {
        Schema.getAllInfo(wetland.getStore().getConnection(Store.ROLE_MASTER)).then(schemaInfo => {
          assert.deepEqual(schemaInfo, schemas.todo);

          done();
        }).catch(console.error);
      }).catch(console.error);
    });

    it('should create my tables (postal)', (done) => {
      let wetland = new Wetland({
        entityPath: __dirname + '/../resource/entity/postal',
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

      new SchemaBuilder(wetland.getManager()).create().apply().then(() => {
        Schema.getAllInfo(wetland.getStore().getConnection(Store.ROLE_MASTER)).then(schemaInfo => {
          assert.deepEqual(schemaInfo, schemas.postal);

          done();
        });
      });
    });
  });
});
