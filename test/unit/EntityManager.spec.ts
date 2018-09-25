import { EntityManager } from '../../src/EntityManager';
import { Wetland } from '../../src/Wetland';
import { User } from '../resource/entity/postal/User';
import { Order } from '../resource/entity/postal/Order';
import { Address } from '../resource/entity/postal/Address';
import { Tracker } from '../resource/entity/postal/Tracker';
import { assert } from 'chai';
function getManager (): EntityManager {
  let wetland = new Wetland({
    entities: [ User, Order ],
    mapping : {
      defaultNamesToUnderscore: true,
    },
  });

  return wetland.getEntityManager();
}

describe('EntityManager', () => {
  describe('.constructor()', () => {
    it('should set wetland', () => {
      let config = getManager().getConfig();

      assert.propertyVal(config.fetch('mapping'), 'defaultNamesToUnderscore', true);
    });
  });

  describe('.createScope()', () => {
    it('should create a scope', () => {
      let scope = getManager().createScope();

      assert.property(scope.getIdentityMap(), 'map');
    });
  });

  describe('.getEntity()', () => {
    it('should fetch the entity', () => {
      let entity = getManager().getEntity('User');

      assert.typeOf(entity, 'function');
    });

    it('should throw an error while fetching an unknown entity', () => {
      assert.throws(() => {
        return getManager().getEntity('Product');
      }, 'No entity found for "Product".');
    });
  });

  describe('.getEntities()', () => {
    it('should retrieve all the registered entities', () => {
      let entities = getManager().getEntities();

      assert.property(entities, 'User');
      assert.property(entities, 'Order');
    });
  });

  describe('.registerEntity()', () => {
    it('Should register an entity', () => {
      let manager = getManager().registerEntity(Address);

      assert.doesNotThrow(() => {
        return manager.getEntity('Address');
      }, 'No entity found for "Address".');
    });
  });

  describe('.getMapping()', () => {
    it('Should get the mapping of the provided entity', () => {
      let fieldNames = getManager().getMapping('User').getFieldNames();

      assert.deepEqual(fieldNames, [ 'id', 'name' ]);
    });
  });

  describe('.registerEntities()', () => {
    it('Should register multiple entities', () => {
      let manager = getManager().registerEntities([ Address, Tracker ]);

      assert.doesNotThrow(() => {
        return manager.getEntity('Address');
      }, 'No entity found for "Address".');

      assert.doesNotThrow(() => {
        return manager.getEntity('Tracker');
      }, 'No entity found for "Tracker".');
    });
  });

  describe('.resolveEntityReference()', () => {
    it('Should resolve provided value to an entity reference', () => {
      assert.equal(getManager().resolveEntityReference('User'), getManager().getEntity('User'));
      assert.isFunction(getManager().resolveEntityReference(() => {}));
      assert.isArray(getManager().resolveEntityReference([]));
      assert.isNull(getManager().resolveEntityReference(null));
    });
  });

});
