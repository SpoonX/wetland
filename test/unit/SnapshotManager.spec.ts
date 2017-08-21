import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {SchemaBuilder} from '../../src/SchemaBuilder';
import {SnapshotManager} from '../../src/SnapshotManager';
import oldEntities from '../resource/entity/snapshot/old';
import newEntities from '../resource/entity/snapshot/new';
import {Book} from '../resource/entity/book/book';
import {Publisher} from '../resource/entity/book/publisher';

function getWetland(entities?): Wetland {
  let wetland = new Wetland({
    stores: {
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

  if (entities) {
    wetland.registerEntities(entities);
  }

  return wetland;
}

function getMapping(entities): Object {
  return getWetland(entities).getSnapshotManager().getSerializable();
}

describe('SnapshotManager', () => {
  describe('diff(fk): change foreign key', () => {
    it('Should drop the old foreign key and create a new one', () => {
      let oldMapping = getMapping(oldEntities),
          newMapping = getMapping(newEntities);

      let wetland         = getWetland(),
          snapshotManager = wetland.getSnapshotManager(),
          schemaBuilder   = new SchemaBuilder(wetland.getManager());

      let diff = snapshotManager.diff(oldMapping, newMapping);

      let sqlStatement = schemaBuilder.process(diff).getSQL().split('\n');

      assert.equal(sqlStatement[0], 'alter table `media` drop foreign key `media_offer_id_foreign`;');
      assert.equal(sqlStatement[1], 'alter table `media` add constraint `media_offer_id_foreign` foreign key (`offer_id`) references `offer` (`id`) on delete cascade');
    });
  });
  describe('diff(jc): create join column', () => {
    it('Should be able to create a non null foreign key', () => {
      let oldMapping = getMapping([]),
          newMapping = getMapping([Book, Publisher]);

      let wetland = getWetland(),
          snapshotManager = wetland.getSnapshotManager(),
          schemaBuilder = new SchemaBuilder(wetland.getManager());

      let diff = snapshotManager.diff(oldMapping, newMapping);

      let sqlStatement = schemaBuilder.process(diff).getSQL().split('\n');

      assert.equal(sqlStatement[0], 'create table `publisher` (`id` int unsigned not null auto_increment primary key, `name` varchar(24) not null);');
      assert.equal(sqlStatement[1], 'create table `book` (`id` int unsigned not null auto_increment primary key, `name` varchar(24) not null, `publisher_id` int unsigned not null);');
    })
  });
});
