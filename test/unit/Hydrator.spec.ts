import {Wetland} from '../../src/Wetland';
import {Scope} from '../../src/Scope';
import {Hydrator} from '../../src/Hydrator';
import {User} from '../resource/entity/postal/User';
import {TransformUser} from '../resource/entity/postal/TransformUser';
import {Tracker} from '../resource/entity/postal/Tracker';
import {assert} from 'chai';
import { ValueObject } from '../resource/entity/ValueObject';

function getHydrator(): Hydrator {
  return new Hydrator(getManager());
}

function getManager(): Scope {
  let wetland = new Wetland();

  return wetland.getManager();
}

describe('Hydrator', () => {
  describe('.constructor()', () => {
    it('should define constructor properties', () => {
      let hydrator = getHydrator();

      assert.property(hydrator, 'unitOfWork');
      assert.property(hydrator, 'entityManager');
      assert.property(hydrator, 'identityMap');
    });
  });

  describe('.fromSchema()', () => {
    it('should map to entities', () => {
      let entity = getHydrator().fromSchema({
        name: 'foo'
      }, User);

      assert.propertyVal(entity, 'name', 'foo');
    });

    it('should map with transformation applied', () => {
      let entity = getHydrator().fromSchema({
        name: 'foo'
      }, TransformUser);

      const expectedValueObject = ValueObject.fromValue('foo')
      assert.property(entity, 'name');
      assert.isTrue(expectedValueObject.equals(entity.name))
    })

    it('should not map invalid value to entities', () => {
      let entity = getHydrator().fromSchema({
        bar: 'foo'
      }, User);

      assert.notProperty(entity, 'bar');
    });

    it('should map to entities with empty object', () => {
      let entity = getHydrator().fromSchema({
        name: 'foo'
      }, {});

      assert.notProperty(entity, 'name');
    });
  });

  describe('.addRecipe', () => {
    it('should add a recipe', () => {
      let recipe = getHydrator().addRecipe(null, 'foo', getManager().getMapping(User), 'single');

      assert.deepEqual(recipe.primaryKey, {alias: 'foo.id', property: 'id'});
      assert.isNull(recipe.parent);
      assert.isFalse(recipe.hydrate);
      assert.equal(recipe.type, 'single');
      assert.isObject(recipe.columns);
      assert.isUndefined(recipe.property);
      assert.equal(recipe.alias, 'foo');
    });
  });
});
