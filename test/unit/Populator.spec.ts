import { Wetland } from '../../src/Wetland';
import { Address } from '../resource/entity/postal/Address';
import { assert } from 'chai';
import { Delivery } from '../resource/entity/postal/Delivery';
import { Order } from '../resource/entity/postal/Order';
import { EntityProxy } from '../../src/EntityProxy';
import { MetaData } from '../../src/MetaData';
import { UnitOfWork } from '../../src/UnitOfWork';
import { ArrayCollection } from '../../src/ArrayCollection';

describe('Populator', () => {
  describe('.assign()', () => {
    it('should populate a new entity', () => {
      let wetland        = new Wetland({});
      let manager        = wetland.getManager();
      let populator      = wetland.getPopulator(manager);
      let dataToPopulate = {
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Land',
      };

      wetland.registerEntity(Address);

      let populatedAddress = populator.assign(Address, dataToPopulate);

      assert.deepEqual(populatedAddress, dataToPopulate);
      assert.instanceOf(populatedAddress, Address);
      assert.strictEqual(manager.getUnitOfWork().getNewObjects()[0], populatedAddress);
      assert.strictEqual(manager.getUnitOfWork().getNewObjects().length, 1);
    });

    it('should populate a new entity, but nested! Wooooo, spooky', () => {
      let wetland        = new Wetland({ mapping: { defaults: { cascades: [ 'persist' ] } } });
      let manager        = wetland.getManager();
      let populator      = wetland.getPopulator(manager);
      let unitOfWork     = manager.getUnitOfWork();
      let dataToPopulate = {
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Land',
        deliveries : [
          { id: 1, order: { name: 'an order' } },
          { created: 'todaaaaaay', order: { id: 10, name: 'changed' } },
        ],
      };

      wetland.registerEntities([ Address, Delivery, Order ]);

      let populatedAddress = populator.assign(Address, dataToPopulate, null, true) as Address;

      let changedCollection = new ArrayCollection;

      changedCollection.push({ id: 10, name: 'changed' });

      unitOfWork.prepareCascades();

      assert.deepEqual(populatedAddress, dataToPopulate);
      assert.deepEqual(populatedAddress['deliveries'][1], { created: 'todaaaaaay', order: { id: 10, name: 'changed' } });
      assert.instanceOf(populatedAddress, Address);
      assert.strictEqual(unitOfWork.getNewObjects()[0], populatedAddress);
      assert.strictEqual(unitOfWork.getNewObjects().length, 3);
      assert.deepEqual(unitOfWork.getDirtyObjects(), changedCollection);
      assert.strictEqual(unitOfWork.getDirtyObjects().length, 1);
      assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 3);
    });

    it('should modify base', () => {
      let wetland        = new Wetland({ mapping: { defaults: { cascades: [ 'persist' ] } } });
      let manager        = wetland.getManager();
      let populator      = wetland.getPopulator(manager);
      let unitOfWork     = manager.getUnitOfWork();
      let cleanOrder     = new Order;
      let cleanDelivery  = new Delivery;
      let cleanAddress   = new Address;
      let dataToPopulate = {
        id         : 1337,
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Land',
        deliveries : [
          { id: 1, order: { name: 'an order' } },
          { created: 'todaaaaaay', order: { id: 10, name: 'changed' } },
        ],
      };

      Object.assign(cleanDelivery, {
        id: 123,
      });

      Object.assign(cleanAddress, {
        id         : 1337,
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Country',
        deliveries : [ cleanDelivery ],
      });

      wetland.registerEntities([ Address, Delivery, Order ]);

      Object.assign(cleanOrder, { id: 10, name: 'changed' });

      unitOfWork.registerClean(cleanOrder);
      unitOfWork.registerClean(cleanAddress);
      unitOfWork.registerClean(cleanDelivery);

      manager.getIdentityMap().register(cleanOrder, EntityProxy.patchEntity(cleanOrder, manager));
      manager.getIdentityMap().register(cleanDelivery, EntityProxy.patchEntity(cleanDelivery, manager));

      let addressProxy = EntityProxy.patchEntity(cleanAddress, manager);

      addressProxy.activateProxying();

      manager.getIdentityMap().register(cleanAddress, addressProxy);

      let populatedAddress = populator.assign(Address, dataToPopulate, null, true) as Address;
      let dataToPopulateCollection = new ArrayCollection;

      dataToPopulateCollection.push(dataToPopulate);

      unitOfWork.prepareCascades();

      let addressEntityState = MetaData.forInstance(addressProxy).fetch('entityState');

      assert.deepEqual(populatedAddress, dataToPopulate);
      assert.deepEqual(populatedAddress['deliveries'][1], { created: 'todaaaaaay', order: { id: 10, name: 'changed' } });
      assert.instanceOf(populatedAddress, Address);
      assert.equal(addressEntityState.state, UnitOfWork.STATE_DIRTY);
      assert.deepEqual(addressEntityState.dirty, [ 'country' ]);
      assert.strictEqual(populatedAddress, addressProxy);
      assert.strictEqual(unitOfWork.getNewObjects().length, 2);
      assert.deepEqual(unitOfWork.getDirtyObjects(), dataToPopulateCollection);
      assert.strictEqual(unitOfWork.getDirtyObjects().length, 1);
      assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 3);
    });

    it('should listen to the recursion level passed in', () => {
      let wetland        = new Wetland({ mapping: { defaults: { cascades: [ 'persist' ] } } });
      let manager        = wetland.getManager();
      let populator      = wetland.getPopulator(manager);
      let cleanDelivery  = new Delivery;
      let cleanAddress   = new Address;
      let dataToPopulate = {
        id         : 1337,
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Land',
        deliveries : [
          { id: 1, order: { name: 'an order' } },
          { created: 'todaaaaaay', order: { id: 10, name: 'changed' } },
        ],
      };

      let expectedData = {
        id         : 1337,
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Land',
        deliveries : [ { id: 1 }, { created: 'todaaaaaay' } ],
      };

      wetland.registerEntities([ Address, Delivery, Order ]);

      Object.assign(cleanAddress, {
        id         : 1337,
        street     : 'I lack imagination',
        houseNumber: 1,
        postcode   : '1234ab',
        country    : 'Country',
        deliveries : [ cleanDelivery ],
      });

      let populatedAddress     = populator.assign(Address, dataToPopulate, null, 1) as Address;
      let populatedAddressDeep = populator.assign(Address, dataToPopulate, null, 2) as Address;

      assert.deepEqual(populatedAddress, expectedData);
      assert.deepEqual(populatedAddressDeep, dataToPopulate);
    });
  });
});
