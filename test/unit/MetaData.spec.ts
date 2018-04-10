import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {MetaData} from '../../src/MetaData';
import {Mapping} from '../../src/Mapping';
import {Product} from '../resource/entity/shop/product';
import {Homefront} from 'homefront';
import {EntityProxy} from '../../src/EntityProxy';

function getUnitOfWork(entity) {
  let wetland = new Wetland;

  if (entity) {
    wetland.registerEntity(Product);
  }

  return wetland.getManager().getUnitOfWork();
}

describe('forTarget()', () => {
  it('should get metadata for provided target', () => {
    let metaData = MetaData.forTarget(Product);

    assert.isTrue(MetaData['metaMap'].has(Product));
    assert.instanceOf(metaData, Homefront);
    assert.instanceOf(metaData.fetch('mapping'), Mapping);
  });
});

describe('ensure', () => {
  it('should ensure metadata', () => {
    let metaData = MetaData.forTarget(Product);

    assert.isTrue(MetaData['metaMap'].has(Product));
    assert.instanceOf(metaData, Homefront);
  });
});

describe('forInstance()', () => {
  it('should get metadata for provided instance', () => {
    let unitOfWork = getUnitOfWork(Product);
    let proxied    = EntityProxy.patchEntity(new Product, unitOfWork.getEntityManager());

    unitOfWork.registerNew(proxied.getTarget());

    proxied.activateProxying();

    let metadata = MetaData.forInstance(proxied);

    assert.strictEqual(metadata.fetch('entityState.state'), 'new');
  });
});

describe('clear()', () => {
  it('should clear metadata for provided targets', () => {
    assert.isTrue(MetaData['metaMap'].has(Product));

    MetaData.clear(Product);

    assert.isFalse(MetaData['metaMap'].has(Product));
  });
});
