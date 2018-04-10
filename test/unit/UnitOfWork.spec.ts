import {assert} from 'chai';
import {UnitOfWork} from '../../src/UnitOfWork';
import {Wetland} from '../../src/Wetland';
import {Scope} from '../../src/Scope';
import {Parent} from '../resource/entity/Parent';
import {Simple} from '../resource/entity/Simple';
import {MetaData} from '../../src/MetaData';
import {Product} from '../resource/entity/shop/product';
import {Category} from '../resource/entity/shop/category';
import {ArrayCollection} from '../../src/ArrayCollection';
import {Image} from '../resource/entity/shop/image';
import {Tag} from '../resource/entity/shop/tag';
import {User} from '../resource/entity/shop/user';
import {Profile} from '../resource/entity/shop/Profile';
import * as path from 'path';

let tmpTestDir = path.join(__dirname, '../.tmp');

function getUnitOfWork(entities?, config = {}): UnitOfWork {
  let wetland = new Wetland(config);

  if (entities) {
    wetland.registerEntities(entities);
  }

  return wetland.getManager().getUnitOfWork();
}

describe('UnitOfWork', () => {
  describe('.getEntityManager()', () => {
    it('should return the entitiymanager', () => {
      let unitOfWork = getUnitOfWork();

      assert.instanceOf(unitOfWork.getEntityManager(), Scope);
    });
  });

  describe('.registerCollectionChange()', () => {
    it('should return unit of work', () => {
      let unitOfWork = getUnitOfWork();

      assert.strictEqual(unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, {}, 'foo', {}), unitOfWork);
    });

    it('should register a new relation for a collection', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple1    = new Simple;
      let simple2    = new Simple;

      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'simples', simple1);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'simples', simple2);

      let relations = MetaData.forInstance(parent).fetch('entityState.relations');

      assert.isTrue(unitOfWork.getRelationshipsChangedObjects().includes(parent));

      assert.strictEqual(relations.added.simples[0], simple1);
      assert.strictEqual(relations.added.simples[1], simple2);
      assert.lengthOf(relations.added.simples, 2);
      assert.lengthOf(Object.keys(relations.added), 1);
      assert.lengthOf(Object.keys(relations.removed), 0);
    });

    it('should register a removed relation for a collection', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple     = new Simple;

      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'simples', simple);

      let relations = MetaData.forInstance(parent).fetch('entityState.relations');

      assert.strictEqual(relations.removed.simples[0], simple);
      assert.lengthOf(relations.removed.simples, 1);
      assert.lengthOf(Object.keys(relations.removed), 1);
      assert.lengthOf(Object.keys(relations.added), 0);
    });

    it('should clean up changed properties and reference on revert', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple1    = new Simple;
      let simple2    = new Simple;

      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'simples', simple1);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'others', simple2);

      assert.isTrue(unitOfWork.getRelationshipsChangedObjects().includes(parent));

      let relations = MetaData.forInstance(parent).fetch('entityState.relations');

      assert.strictEqual(relations.added.simples[0], simple1);
      assert.lengthOf(relations.added.simples, 1);
      assert.lengthOf(Object.keys(relations.added), 2);
      assert.lengthOf(Object.keys(relations.removed), 0);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'simples', simple1);
      assert.deepEqual(relations, {added: {others: [simple2]}, removed: {}});
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'others', simple2);
      assert.deepEqual(relations, {added: {}, removed: {}});
      assert.deepEqual(MetaData.forInstance(parent).fetch('entityState'), {});

      assert.isFalse(unitOfWork.getRelationshipsChangedObjects().includes(parent));
    });
  });

  describe('.registerRelationChange()', () => {
    it('should return unit of work', () => {
      let unitOfWork = getUnitOfWork();

      assert.strictEqual(unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, {}, 'foo', {}), unitOfWork);
    });

    it('should register a new relation change for single', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple     = new Simple;

      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple);

      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.added.single'), simple);
    });

    it('should overwrite on registering a new relation change for single', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple1    = new Simple;
      let simple2    = new Simple;

      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple1);
      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.added.single'), simple1);
      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple2);
      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.added.single'), simple2);
      assert.deepEqual(MetaData.forInstance(parent).fetch('entityState.relations.removed'), {});
    });

    it('should register a removed relation change for single', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple     = new Simple;

      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple);

      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple);
    });

    it('should overwrite a removed relation change for single', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple1    = new Simple;
      let simple2    = new Simple;

      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple1);
      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple1);
      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple2);
      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple2);
      assert.deepEqual(MetaData.forInstance(parent).fetch('entityState.relations.added'), {});
    });

    it('should remove the link when added after remove', () => {
      let unitOfWork = getUnitOfWork();
      let parent     = new Parent;
      let simple     = new Simple;

      assert.deepEqual(MetaData.forInstance(parent).fetch('entityState', {}), {});
      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple);
      assert.strictEqual(MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple);
      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple);
      assert.deepEqual(MetaData.forInstance(parent).fetch('entityState'), {});
    });
  });

  describe('.setEntityState()', () => {
    it('should set the entity state', () => {

    });

    it('should return self and leave state untouched', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      assert.strictEqual(unitOfWork.setEntityState(simple, UnitOfWork.STATE_UNKNOWN), unitOfWork);
    });

    it('should remove the previous entity state', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.setEntityState(simple, UnitOfWork.STATE_DIRTY);

      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_DIRTY);

      assert.isTrue(unitOfWork.getDirtyObjects().includes(simple));
      assert.isFalse(unitOfWork.getCleanObjects().includes(simple));
      assert.isFalse(unitOfWork.getNewObjects().includes(simple));
      assert.isFalse(unitOfWork.getDeletedObjects().includes(simple));

      unitOfWork.setEntityState(simple, UnitOfWork.STATE_DELETED);

      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_DELETED);

      assert.isTrue(unitOfWork.getDeletedObjects().includes(simple));
      assert.isFalse(unitOfWork.getCleanObjects().includes(simple));
      assert.isFalse(unitOfWork.getNewObjects().includes(simple));
      assert.isFalse(unitOfWork.getDirtyObjects().includes(simple));
    });
  });

  describe('.registerNew()', () => {
    it('should throw an error when entity not unpersisted', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerClean(simple);

      assert.throws(() => {
        unitOfWork.registerNew(simple);
      }, "Only unregistered entities can be marked as new. Entity 'Simple' has state 'clean'.");
    });
    it('should register the entity as new', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerNew(simple);
      assert.isTrue(unitOfWork.getNewObjects().includes(simple));
      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_NEW);
    });
  });

  describe('.registerDirty()', () => {
    it('should register the properties that are dirty', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerClean(simple);

      unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
    });

    it('should throw an error when trying to register deleted as dirty (and maintain dirty properties)', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerClean(simple);
      unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
      unitOfWork.registerDeleted(simple);

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);

      assert.throws(() => {
        unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
      }, 'Trying to mark entity staged for deletion as dirty.');
    });

    it('should do nothing when entity is new', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerNew(simple);

      unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), null);
    });

    it('should register the entity as dirty', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerClean(simple);
      unitOfWork.registerDirty(simple, 'foo');
      assert.isTrue(unitOfWork.getDirtyObjects().includes(simple));
      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_DIRTY);
    });
  });

  describe('.registerDeleted()', () => {
    it('should register the entity as deleted', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerDeleted(simple);
      assert.isTrue(unitOfWork.getDeletedObjects().includes(simple));
      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_DELETED);
    });
  });

  describe('.registerClean()', () => {
    it('should not revert changes when fresh entity', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerClean(simple);
      unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);

      unitOfWork.registerClean(simple, true);

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
    });

    it('should revert changes when not fresh entity', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;
      let parent     = new Parent;

      unitOfWork.registerClean(simple);
      unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);

      unitOfWork.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple);

      assert.deepEqual(MetaData.forInstance(parent).fetch('entityState.relations'), {
        added  : {single: simple},
        removed: {}
      });

      unitOfWork.registerClean(simple);

      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.dirty'), null);
      assert.deepEqual(MetaData.forInstance(simple).fetch('entityState.relations'), null);
    });

    it('should register the entity as clean', () => {
      let unitOfWork = getUnitOfWork();
      let simple     = new Simple;

      unitOfWork.registerClean(simple);
      assert.isTrue(unitOfWork.getCleanObjects().includes(simple));
      assert.strictEqual(UnitOfWork.getObjectState(simple), UnitOfWork.STATE_CLEAN);
    });
  });

  describe('.prepareCascades()', () => {
    // Test link, exception on no cascade but new, test on new adds link
    it('should prepare no cascades when not needed', () => {
      let unitOfWork = getUnitOfWork();

      unitOfWork.prepareCascades();

      assert.lengthOf(unitOfWork.getDeletedObjects(), 0);
      assert.lengthOf(unitOfWork.getDirtyObjects(), 0);
      assert.lengthOf(unitOfWork.getNewObjects(), 0);
      assert.lengthOf(unitOfWork.getCleanObjects(), 0);
      assert.lengthOf(unitOfWork.getRelationshipsChangedObjects(), 0);
    });

    it('should prepare cascades for one-sided relationship', function () {
      let config          = {mapping: {defaults: {cascades: ['persist']}}};
      let unitOfWork      = getUnitOfWork([Simple, Parent], config);
      let entityManager   = unitOfWork.getEntityManager();
      let parent          = new Parent;
      let simple1         = new Simple;
      let simple2         = new Simple;
      let simple3         = new Simple;
      simple1.dateOfBirth = new Date('1/1/2001');
      simple2.dateOfBirth = new Date('1/1/2002');
      simple3.dateOfBirth = new Date('1/1/2003');
      parent.single       = simple1;

      parent.simples.add(simple2, simple3);

      entityManager.persist(parent);

      unitOfWork.prepareCascades();

      assert.lengthOf(unitOfWork.getDeletedObjects(), 0);
      assert.lengthOf(unitOfWork.getDirtyObjects(), 0);
      assert.lengthOf(unitOfWork.getNewObjects(), 4);
      assert.lengthOf(unitOfWork.getCleanObjects(), 0);
      assert.lengthOf(unitOfWork.getRelationshipsChangedObjects(), 1);
      assert.strictEqual(unitOfWork.getRelationshipsChangedObjects()[0].single, simple1);
      assert.sameMembers(unitOfWork.getRelationshipsChangedObjects()[0].simples, [simple2, simple3]);
    });

    it('should prepare cascades for persist when new relation', () => {
      let unitOfWork     = getUnitOfWork([Product, Category]);
      let entityManager  = unitOfWork.getEntityManager();
      let product        = new Product;
      let categoryOne    = new Category;
      let categoryTwo    = new Category;
      product.name       = 'test product';
      categoryOne.name   = 'test category one';
      categoryTwo.name   = 'test category two';
      product.categories = new ArrayCollection;

      product.categories.push(categoryOne, categoryTwo);

      entityManager.persist(product);

      unitOfWork.prepareCascades();

      assert.lengthOf(unitOfWork.getDeletedObjects(), 0);
      assert.lengthOf(unitOfWork.getDirtyObjects(), 0);
      assert.lengthOf(unitOfWork.getNewObjects(), 3);
      assert.lengthOf(unitOfWork.getCleanObjects(), 0);
      assert.lengthOf(unitOfWork.getRelationshipsChangedObjects(), 1);
      assert.strictEqual(unitOfWork.getRelationshipsChangedObjects()[0], product);

      assert.deepEqual(MetaData.forInstance(product).fetch('entityState.relations'), {
        removed: {},
        added  : {categories: [categoryOne, categoryTwo]}
      });
    });

    it('should throw an error for persist when new relation has no cascade persist set', () => {
      // Fresh start.
      MetaData.clear(Product, User);

      let unitOfWork    = getUnitOfWork([Product, User]);
      let entityManager = unitOfWork.getEntityManager();
      let product       = new Product;
      product.author    = new User;

      entityManager.persist(product);

      // Expected error which wasn't thrown because author.cascade === ['persist'] 
      assert.throws(() => {
        unitOfWork.prepareCascades();
      }, 'Un-persisted relation found on "Product.author". Either persist the entity, or use the cascade persist option.');
    });

    it('should throw an error for persist when new relation is marked as deleted', () => {
      let unitOfWork     = getUnitOfWork([Product, User]);
      let entityManager  = unitOfWork.getEntityManager();
      let product        = new Product;
      let category       = new Category;
      product.categories = new ArrayCollection;

      product.categories.push(category);

      unitOfWork.registerDeleted(category);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, product, 'categories', category);
      entityManager.persist(product);

      assert.throws(() => {
        unitOfWork.prepareCascades();
      }, 'Trying to add relation with entity on "Product.categories" that has been staged for removal.');
    });

    it('should prepare cascades for persist when new collection', () => {
      let unitOfWork     = getUnitOfWork([Product, User]);
      let product        = new Product;
      let category       = new Category;
      let category2      = new Category;
      product.categories = new ArrayCollection;

      product.categories.push(category, category2);

      unitOfWork.registerClean(product);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, product, 'categories', category);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, product, 'categories', category2);

      unitOfWork.prepareCascades();

      assert.lengthOf(unitOfWork.getNewObjects(), 2);
    });

    it('should prepare cascades recursively (aka the shit-show test)', () => {
      let unitOfWork     = getUnitOfWork([Product, Category, Image, Tag, User, Profile]);
      let entityManager  = unitOfWork.getEntityManager();
      let product        = new Product;
      let profile        = new Profile;
      let categoryOne    = new Category;
      let categoryTwo    = new Category;
      let categoryThree  = new Category;
      let image          = new Image;
      let tagOne         = new Tag;
      let tagTwo         = new Tag;
      let tagThree       = new Tag;
      let tagFour        = new Tag;
      let creatorOne     = new User;
      let creatorTwo     = new User;
      let creatorThree   = new User;
      let creatorFour    = new User;
      profile.slogan     = 'No harm, try harder.';
      creatorOne.name    = 'test tag one creator';
      creatorTwo.name    = 'test tag two creator';
      creatorThree.name  = 'test tag three creator';
      creatorFour.name   = 'test tag four creator';
      creatorOne.profile = profile;
      image.name         = 'test image';
      tagOne.name        = 'test tag one';
      tagOne.creator     = creatorOne;
      tagTwo.name        = 'test tag two';
      tagTwo.creator     = creatorTwo;
      tagThree.name      = 'test tag three';
      tagThree.creator   = creatorThree;
      tagFour.name       = 'test tag four';
      tagFour.creator    = creatorFour;
      product.name       = 'test product';
      categoryOne.name   = 'test category one';
      categoryTwo.name   = 'test category two';
      categoryThree.name = 'test category three';
      product.categories = new ArrayCollection;
      product.image      = image;
      image.tags         = new ArrayCollection;
      categoryThree.tags = new ArrayCollection;

      categoryThree.tags.push(tagThree, tagFour);

      unitOfWork.registerClean(categoryThree, true);
      unitOfWork.registerClean(creatorThree, true);
      unitOfWork.registerClean(tagThree, true);

      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_REMOVED, categoryThree, 'tags', tagThree);
      unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, categoryThree, 'tags', tagFour);

      product.categories.push(categoryOne, categoryTwo, categoryThree);
      image.tags.push(tagOne, tagTwo);

      entityManager.persist(product);

      assert.lengthOf(unitOfWork.getNewObjects(), 1);
      assert.lengthOf(unitOfWork.getRelationshipsChangedObjects(), 1);

      unitOfWork.prepareCascades();

      assert.lengthOf(unitOfWork.getDeletedObjects(), 0);
      assert.lengthOf(unitOfWork.getDirtyObjects(), 0);
      assert.lengthOf(unitOfWork.getNewObjects(), 11);
      assert.lengthOf(unitOfWork.getCleanObjects(), 3);

      // 1 product, 1 category (other two don't have relations), 3 tags, 1 image
      assert.lengthOf(unitOfWork.getRelationshipsChangedObjects(), 7);

      assert.deepEqual(MetaData.forInstance(product).fetch('entityState.relations'), {
        removed: {},
        added  : {
          categories: [categoryOne, categoryTwo, categoryThree],
          image     : image
        }
      });

      assert.deepEqual(MetaData.forInstance(image).fetch('entityState.relations'), {
        removed: {},
        added  : {tags: [tagOne, tagTwo]}
      });

      assert.strictEqual(MetaData.forInstance(categoryOne).fetch('entityState.relations'), null);

      assert.strictEqual(MetaData.forInstance(categoryTwo).fetch('entityState.relations'), null);

      assert.deepEqual(MetaData.forInstance(categoryThree).fetch('entityState.relations'), {
        removed: {tags: [tagThree]},
        added  : {tags: [tagFour]}
      });

      assert.deepEqual(MetaData.forInstance(tagOne).fetch('entityState.relations'), {
        removed: {},
        added  : {creator: creatorOne}
      });

      assert.deepEqual(MetaData.forInstance(tagTwo).fetch('entityState.relations'), {
        removed: {},
        added  : {creator: creatorTwo}
      });
    });
  });

  describe('.commit()', () => {
    it('should persist all the changes properly (aka the shit-show-but-with-persist-as-well test)', done => {
      let wetland = new Wetland({
        stores  : {
          defaultStore: {
            client          : 'sqlite3',
            useNullAsDefault: true,
            connection      : {
              filename: `${tmpTestDir}/shitshow-persist.sqlite`
            }
          }
        },
        entities: [Product, Category, Image, Tag, User, Profile]
      });

      wetland.getSchemaManager().create().then(() => {
        let entityManager  = wetland.getManager();
        let unitOfWork     = entityManager.getUnitOfWork();
        let product        = new Product;
        let profile        = new Profile;
        let categoryOne    = new Category;
        let categoryTwo    = new Category;
        let categoryThree  = new Category;
        let image          = new Image;
        let tagOne         = new Tag;
        let tagTwo         = new Tag;
        let tagThree       = new Tag;
        let tagFour        = new Tag;
        let creatorOne     = new User;
        let creatorTwo     = new User;
        let creatorThree   = new User;
        let creatorFour    = new User;
        profile.slogan     = 'No harm, try harder.';
        creatorOne.name    = 'test tag one creator';
        creatorTwo.name    = 'test tag two creator';
        creatorThree.name  = 'test tag three creator';
        creatorFour.name   = 'test tag four creator';
        creatorOne.profile = profile;
        image.name         = 'test image';
        tagOne.name        = 'test tag one';
        tagOne.creator     = creatorOne;
        tagTwo.name        = 'test tag two';
        tagTwo.creator     = creatorTwo;
        tagThree.id        = 3;
        tagThree.name      = 'test tag three';
        tagThree.creator   = creatorThree;
        tagFour.name       = 'test tag four';
        tagFour.creator    = creatorFour;
        product.name       = 'test product';
        categoryOne.name   = 'test category one';
        categoryTwo.name   = 'test category two';
        categoryThree.name = 'test category three';
        product.categories = new ArrayCollection;
        product.image      = image;
        image.tags         = new ArrayCollection;
        categoryThree.tags = new ArrayCollection;
        categoryThree.id   = 6;

        categoryThree.tags.push(tagThree, tagFour);

        unitOfWork.registerClean(categoryThree, true);
        unitOfWork.registerClean(creatorThree, true);
        unitOfWork.registerClean(tagThree, true);

        unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_REMOVED, categoryThree, 'tags', tagThree);
        unitOfWork.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, categoryThree, 'tags', tagFour);
        unitOfWork.registerDirty(tagThree, 'name');

        product.categories.push(categoryOne, categoryTwo, categoryThree);
        image.tags.push(tagOne, tagTwo);

        entityManager.persist(product);

        assert.lengthOf(unitOfWork.getNewObjects(), 1);
        assert.lengthOf(unitOfWork.getRelationshipsChangedObjects(), 1);

        entityManager.flush().then(() => {
          entityManager.getRepository(User).findOne({name: 'test tag one creator'}, {populate: {'profile': 'p'}})
            .then(user => {
              assert.strictEqual(user.profile.slogan, 'No harm, try harder.');

              wetland.destroyConnections().then(() => {
                done();
              });
            }).catch(done);
        }).catch(done);
      }).catch(done);
    });
  });

  describe('.processAfterCommit()', () => {
    it('Should call post-lifecyle callbacks hook with a clean unit of work', callback => {
      class User {
        static setMapping(mapping) {
          mapping.forProperty('id').primary().increments();
        }

        afterCreate(entityManager) {
          const unitOfWork = entityManager.getUnitOfWork();

          assert.lengthOf(unitOfWork.getDirtyObjects(), 0);
          assert.lengthOf(unitOfWork.getDeletedObjects(), 0);
          assert.lengthOf(unitOfWork.getNewObjects(), 0);

          callback();
        }
      }

      let wetland = new Wetland({entities: [User]});

      let migrator = wetland.getMigrator();
      let manager  = wetland.getManager();

      migrator.devMigrations(false)
        .then(() => manager.persist(new User()).flush());
    });
  });
});
