import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {Scope} from '../../src/Scope';
import {UnitOfWork} from '../../src/UnitOfWork';
import {Simple} from '../resource/entity/Simple';
import {EntityRepository} from '../../src/EntityRepository';
import {WithCustomRepository} from '../resource/entity/WithCustomRepository';
import {CustomRepository} from '../resource/repository/CustomRepository';

function entityManager(entities?): Scope {
  let wetland = new Wetland({});

  if (entities) {
    wetland.registerEntities(entities);
  }

  return wetland.getManager();
}

describe('Scope', () => {
  describe('.getRepository()', () => {
    it('should return a default repository', () => {
      let scope = entityManager([Simple]);

      assert.instanceOf(scope.getRepository(Simple), EntityRepository);
    });

    it('should return a custom repository', () => {
      let scope = entityManager([WithCustomRepository]);

      assert.instanceOf(scope.getRepository(WithCustomRepository), EntityRepository);
      assert.instanceOf(scope.getRepository(WithCustomRepository), CustomRepository);
    });
  });

  describe('.getUnitOfWork()', () => {
    it('should return the UnitOfWork', () => {
      let scope = entityManager();

      assert.instanceOf(scope.getUnitOfWork(), UnitOfWork);
    });
  });

  describe('.persist()', () => {
    it('should add the entity to the unitOfWork', () => {
      let scope  = entityManager([Simple]);
      let simple = new Simple;

      scope.persist(simple);

      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_NEW);
    });

    it('should return Scope', () => {
      let scope = entityManager([Simple]);

      assert.strictEqual(scope.persist(new Simple), scope);
    });
  });

  describe('.remove()', () => {
    it('should add the entity to the unitOfWork as "deleted"', () => {
      let scope  = entityManager([Simple]);
      let simple = new Simple;

      scope.remove(simple);

      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_DELETED);
    });

    it('should return Scope', () => {
      let scope = entityManager([Simple]);

      assert.strictEqual(scope.remove(new Simple), scope);
    });
  });

  describe('.getReference()', () => {
    it('should return a reference', () => {
      // @todo test if delete works like this:
      // entityManager.remove(entityManager.getReference('Foo', 6));
    });
  });

  describe('.clear()', () => {
    it('should reset the unit of work', () => {
      let scope  = entityManager([Simple]);
      let simple = new Simple;

      scope.remove(simple);

      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_DELETED);

      scope.clear();

      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_UNKNOWN);
    });
  });
});
