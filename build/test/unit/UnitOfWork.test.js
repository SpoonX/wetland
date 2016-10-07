"use strict";
const chai_1 = require('chai');
const UnitOfWork_1 = require('../../src/UnitOfWork');
const Wetland_1 = require('../../src/Wetland');
const Scope_1 = require('../../src/Scope');
const Parent_1 = require('../resource/entity/Parent');
const Simple_1 = require('../resource/entity/Simple');
const MetaData_1 = require('../../src/MetaData');
const product_1 = require('../resource/entity/shop/product');
const category_1 = require('../resource/entity/shop/category');
const ArrayCollection_1 = require('../../src/ArrayCollection');
const image_1 = require('../resource/entity/shop/image');
const tag_1 = require('../resource/entity/shop/tag');
const user_1 = require('../resource/entity/shop/user');
const Profile_1 = require('../resource/entity/shop/Profile');
const path = require('path');
let tmpTestDir = path.join(__dirname, '../.tmp');
function getUnitOfWork(entities) {
    let wetland = new Wetland_1.Wetland({});
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland.getManager().getUnitOfWork();
}
describe('UnitOfWork', () => {
    describe('.getEntityManager()', () => {
        it('should return the entitiymanager', () => {
            let unitOfWork = getUnitOfWork();
            chai_1.assert.instanceOf(unitOfWork.getEntityManager(), Scope_1.Scope);
        });
    });
    describe('.registerCollectionChange()', () => {
        it('should return unit of work', () => {
            let unitOfWork = getUnitOfWork();
            chai_1.assert.strictEqual(unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, {}, 'foo', {}), unitOfWork);
        });
        it('should register a new relation for a collection', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple1 = new Simple_1.Simple;
            let simple2 = new Simple_1.Simple;
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'simples', simple1);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'simples', simple2);
            let relations = MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations');
            chai_1.assert.isTrue(unitOfWork.getRelationshipsChangedObjects().includes(parent));
            chai_1.assert.strictEqual(relations.added.simples[0], simple1);
            chai_1.assert.strictEqual(relations.added.simples[1], simple2);
            chai_1.assert.strictEqual(relations.added.simples.length, 2);
            chai_1.assert.strictEqual(Object.keys(relations.added).length, 1);
            chai_1.assert.strictEqual(Object.keys(relations.removed).length, 0);
        });
        it('should register a removed relation for a collection', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple = new Simple_1.Simple;
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'simples', simple);
            let relations = MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations');
            chai_1.assert.strictEqual(relations.removed.simples[0], simple);
            chai_1.assert.strictEqual(relations.removed.simples.length, 1);
            chai_1.assert.strictEqual(Object.keys(relations.removed).length, 1);
            chai_1.assert.strictEqual(Object.keys(relations.added).length, 0);
        });
        it('should clean up changed properties and reference on revert', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple1 = new Simple_1.Simple;
            let simple2 = new Simple_1.Simple;
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'simples', simple1);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'others', simple2);
            chai_1.assert.isTrue(unitOfWork.getRelationshipsChangedObjects().includes(parent));
            let relations = MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations');
            chai_1.assert.strictEqual(relations.added.simples[0], simple1);
            chai_1.assert.strictEqual(relations.added.simples.length, 1);
            chai_1.assert.strictEqual(Object.keys(relations.added).length, 2);
            chai_1.assert.strictEqual(Object.keys(relations.removed).length, 0);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'simples', simple1);
            chai_1.assert.deepEqual(relations, { added: { others: [simple2] }, removed: {} });
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'others', simple2);
            chai_1.assert.deepEqual(relations, { added: {}, removed: {} });
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState'), {});
            chai_1.assert.isFalse(unitOfWork.getRelationshipsChangedObjects().includes(parent));
        });
    });
    describe('.registerRelationChange()', () => {
        it('should return unit of work', () => {
            let unitOfWork = getUnitOfWork();
            chai_1.assert.strictEqual(unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, {}, 'foo', {}), unitOfWork);
        });
        it('should register a new relation change for single', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple = new Simple_1.Simple;
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.added.single'), simple);
        });
        it('should overwrite on registering a new relation change for single', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple1 = new Simple_1.Simple;
            let simple2 = new Simple_1.Simple;
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple1);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.added.single'), simple1);
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple2);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.added.single'), simple2);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.removed'), {});
        });
        it('should register a removed relation change for single', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple = new Simple_1.Simple;
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple);
        });
        it('should overwrite a removed relation change for single', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple1 = new Simple_1.Simple;
            let simple2 = new Simple_1.Simple;
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple1);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple1);
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple2);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple2);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.added'), {});
        });
        it('should remove the link when added after remove', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple = new Simple_1.Simple;
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState', {}), {});
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, parent, 'single', simple);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations.removed.single'), simple);
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState'), {});
        });
    });
    describe('.setEntityState()', () => {
        it('should set the entity state', () => {
        });
        it('should return self and leave state untouched', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            chai_1.assert.strictEqual(unitOfWork.setEntityState(simple, UnitOfWork_1.UnitOfWork.STATE_UNKNOWN), unitOfWork);
        });
        it('should remove the previous entity state', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.setEntityState(simple, UnitOfWork_1.UnitOfWork.STATE_DIRTY);
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_DIRTY);
            chai_1.assert.isTrue(unitOfWork.getDirtyObjects().includes(simple));
            chai_1.assert.isFalse(unitOfWork.getCleanObjects().includes(simple));
            chai_1.assert.isFalse(unitOfWork.getNewObjects().includes(simple));
            chai_1.assert.isFalse(unitOfWork.getDeletedObjects().includes(simple));
            unitOfWork.setEntityState(simple, UnitOfWork_1.UnitOfWork.STATE_DELETED);
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_DELETED);
            chai_1.assert.isTrue(unitOfWork.getDeletedObjects().includes(simple));
            chai_1.assert.isFalse(unitOfWork.getCleanObjects().includes(simple));
            chai_1.assert.isFalse(unitOfWork.getNewObjects().includes(simple));
            chai_1.assert.isFalse(unitOfWork.getDirtyObjects().includes(simple));
        });
    });
    describe('.registerNew()', () => {
        it('should register the entity as new', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerNew(simple);
            chai_1.assert.isTrue(unitOfWork.getNewObjects().includes(simple));
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_NEW);
        });
    });
    describe('.registerDirty()', () => {
        it('should register the properties that are dirty', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerClean(simple);
            unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
        });
        it('should throw an error when trying to register deleted as dirty (and maintain dirty properties)', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerClean(simple);
            unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
            unitOfWork.registerDeleted(simple);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
            chai_1.assert.throws(() => {
                unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
            }, 'Trying to mark entity staged for deletion as dirty.');
        });
        it('should do nothing when entity is new', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerNew(simple);
            unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), null);
        });
        it('should register the entity as dirty', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerClean(simple);
            unitOfWork.registerDirty(simple, 'foo');
            chai_1.assert.isTrue(unitOfWork.getDirtyObjects().includes(simple));
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_DIRTY);
        });
    });
    describe('.registerDeleted()', () => {
        it('should register the entity as deleted', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerDeleted(simple);
            chai_1.assert.isTrue(unitOfWork.getDeletedObjects().includes(simple));
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_DELETED);
        });
    });
    describe('.registerClean()', () => {
        it('should not revert changes when fresh entity', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerClean(simple);
            unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
            unitOfWork.registerClean(simple, true);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
        });
        it('should revert changes when not fresh entity', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            let parent = new Parent_1.Parent;
            unitOfWork.registerClean(simple);
            unitOfWork.registerDirty(simple, 'cake', 'foo', 'bar');
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), ['cake', 'foo', 'bar']);
            unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, parent, 'single', simple);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(parent).fetch('entityState.relations'), {
                added: { single: simple },
                removed: {}
            });
            unitOfWork.registerClean(simple);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.dirty'), null);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(simple).fetch('entityState.relations'), null);
        });
        it('should register the entity as clean', () => {
            let unitOfWork = getUnitOfWork();
            let simple = new Simple_1.Simple;
            unitOfWork.registerClean(simple);
            chai_1.assert.isTrue(unitOfWork.getCleanObjects().includes(simple));
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_CLEAN);
        });
    });
    describe('.prepareCascades()', () => {
        // Test link, exception on no cascade but new, test on new adds link
        it('should prepare no cascades when not needed', () => {
            let unitOfWork = getUnitOfWork();
            unitOfWork.prepareCascades();
            chai_1.assert.strictEqual(unitOfWork.getDeletedObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getDirtyObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getCleanObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 0);
        });
        it('should prepare cascades for persist when new relation', () => {
            let unitOfWork = getUnitOfWork([product_1.Product, category_1.Category]);
            let entityManager = unitOfWork.getEntityManager();
            let product = new product_1.Product;
            let categoryOne = new category_1.Category;
            let categoryTwo = new category_1.Category;
            product.name = 'test product';
            categoryOne.name = 'test category one';
            categoryTwo.name = 'test category two';
            product.categories = new ArrayCollection_1.ArrayCollection;
            product.categories.push(categoryOne, categoryTwo);
            entityManager.persist(product);
            unitOfWork.prepareCascades();
            chai_1.assert.strictEqual(unitOfWork.getDeletedObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getDirtyObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 3);
            chai_1.assert.strictEqual(unitOfWork.getCleanObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 1);
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects()[0], product);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(product).fetch('entityState.relations'), {
                removed: {},
                added: { categories: [categoryOne, categoryTwo] }
            });
        });
        it('should throw an error for persist when new relation has no cascade persist set', () => {
            let unitOfWork = getUnitOfWork([product_1.Product, user_1.User]);
            let entityManager = unitOfWork.getEntityManager();
            let product = new product_1.Product;
            product.author = new user_1.User;
            entityManager.persist(product);
            chai_1.assert.throws(() => {
                unitOfWork.prepareCascades();
            }, 'Un-persisted relation found on "Product.author". Either persist the entity, or use the cascade persist option.');
        });
        it('should throw an error for persist when new relation is marked as deleted', () => {
            let unitOfWork = getUnitOfWork([product_1.Product, user_1.User]);
            let entityManager = unitOfWork.getEntityManager();
            let product = new product_1.Product;
            let category = new category_1.Category;
            product.categories = new ArrayCollection_1.ArrayCollection;
            product.categories.push(category);
            unitOfWork.registerDeleted(category);
            unitOfWork.registerClean(product);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, product, 'categories', category);
            entityManager.persist(product);
            chai_1.assert.throws(() => {
                unitOfWork.prepareCascades();
            }, 'Trying to add relation with entity on "Product.categories" that has been staged for removal.');
        });
        it('should prepare cascades for persist when new collection', () => {
            let unitOfWork = getUnitOfWork([product_1.Product, user_1.User]);
            let entityManager = unitOfWork.getEntityManager();
            let product = new product_1.Product;
            let category = new category_1.Category;
            let category2 = new category_1.Category;
            product.categories = new ArrayCollection_1.ArrayCollection;
            product.categories.push(category, category2);
            unitOfWork.registerClean(product);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, product, 'categories', category);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, product, 'categories', category2);
            entityManager.persist(product);
            unitOfWork.prepareCascades();
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 2);
        });
        it('should prepare cascades recursively (aka the shit-show test)', () => {
            let unitOfWork = getUnitOfWork([product_1.Product, category_1.Category, image_1.Image, tag_1.Tag, user_1.User, Profile_1.Profile]);
            let entityManager = unitOfWork.getEntityManager();
            let product = new product_1.Product;
            let profile = new Profile_1.Profile;
            let categoryOne = new category_1.Category;
            let categoryTwo = new category_1.Category;
            let categoryThree = new category_1.Category;
            let image = new image_1.Image;
            let tagOne = new tag_1.Tag;
            let tagTwo = new tag_1.Tag;
            let tagThree = new tag_1.Tag;
            let tagFour = new tag_1.Tag;
            let creatorOne = new user_1.User;
            let creatorTwo = new user_1.User;
            let creatorThree = new user_1.User;
            let creatorFour = new user_1.User;
            profile.slogan = 'No harm, try harder.';
            creatorOne.name = 'test tag one creator';
            creatorTwo.name = 'test tag two creator';
            creatorThree.name = 'test tag three creator';
            creatorFour.name = 'test tag four creator';
            creatorOne.profile = profile;
            image.name = 'test image';
            tagOne.name = 'test tag one';
            tagOne.creator = creatorOne;
            tagTwo.name = 'test tag two';
            tagTwo.creator = creatorTwo;
            tagThree.name = 'test tag three';
            tagThree.creator = creatorThree;
            tagFour.name = 'test tag four';
            tagFour.creator = creatorFour;
            product.name = 'test product';
            categoryOne.name = 'test category one';
            categoryTwo.name = 'test category two';
            categoryThree.name = 'test category three';
            product.categories = new ArrayCollection_1.ArrayCollection;
            product.image = image;
            image.tags = new ArrayCollection_1.ArrayCollection;
            categoryThree.tags = new ArrayCollection_1.ArrayCollection;
            categoryThree.tags.push(tagThree, tagFour);
            unitOfWork.registerClean(categoryThree, true);
            unitOfWork.registerClean(creatorThree, true);
            unitOfWork.registerClean(tagThree, true);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, categoryThree, 'tags', tagThree);
            unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, categoryThree, 'tags', tagFour);
            product.categories.push(categoryOne, categoryTwo, categoryThree);
            image.tags.push(tagOne, tagTwo);
            entityManager.persist(product);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 1);
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 1);
            unitOfWork.prepareCascades();
            chai_1.assert.strictEqual(unitOfWork.getDeletedObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getDirtyObjects().length, 0);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 11);
            chai_1.assert.strictEqual(unitOfWork.getCleanObjects().length, 3);
            // 1 product, 1 category (other two don't have relations), 3 tags, 1 image
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 7);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(product).fetch('entityState.relations'), {
                removed: {},
                added: {
                    categories: [categoryOne, categoryTwo, categoryThree],
                    image: image
                }
            });
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(image).fetch('entityState.relations'), {
                removed: {},
                added: { tags: [tagOne, tagTwo] }
            });
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(categoryOne).fetch('entityState.relations'), null);
            chai_1.assert.strictEqual(MetaData_1.MetaData.forInstance(categoryTwo).fetch('entityState.relations'), null);
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(categoryThree).fetch('entityState.relations'), {
                removed: { tags: [tagThree] },
                added: { tags: [tagFour] }
            });
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(tagOne).fetch('entityState.relations'), {
                removed: {},
                added: { creator: creatorOne }
            });
            chai_1.assert.deepEqual(MetaData_1.MetaData.forInstance(tagTwo).fetch('entityState.relations'), {
                removed: {},
                added: { creator: creatorTwo }
            });
        });
    });
    describe('.commit()', () => {
        it('should persist all the changes properly (aka the shit-show-but-with-persist-as-well test)', done => {
            let wetland = new Wetland_1.Wetland({
                stores: {
                    'default': {
                        client: 'sqlite3',
                        useNullAsDefault: true,
                        connection: {
                            filename: `${tmpTestDir}/shitshow-persist.sqlite`
                        }
                    }
                },
                entities: [product_1.Product, category_1.Category, image_1.Image, tag_1.Tag, user_1.User, Profile_1.Profile]
            });
            console.log(wetland.getMigrator().create().getSQL());
            wetland.getMigrator().create().apply().then(() => {
                let entityManager = wetland.getManager();
                let unitOfWork = entityManager.getUnitOfWork();
                let product = new product_1.Product;
                let profile = new Profile_1.Profile;
                let categoryOne = new category_1.Category;
                let categoryTwo = new category_1.Category;
                let categoryThree = new category_1.Category;
                let image = new image_1.Image;
                let tagOne = new tag_1.Tag;
                let tagTwo = new tag_1.Tag;
                let tagThree = new tag_1.Tag;
                let tagFour = new tag_1.Tag;
                let creatorOne = new user_1.User;
                let creatorTwo = new user_1.User;
                let creatorThree = new user_1.User;
                let creatorFour = new user_1.User;
                profile.slogan = 'No harm, try harder.';
                creatorOne.name = 'test tag one creator';
                creatorTwo.name = 'test tag two creator';
                creatorThree.name = 'test tag three creator';
                creatorFour.name = 'test tag four creator';
                creatorOne.profile = profile;
                image.name = 'test image';
                tagOne.name = 'test tag one';
                tagOne.creator = creatorOne;
                tagTwo.name = 'test tag two';
                tagTwo.creator = creatorTwo;
                tagThree.id = 3;
                tagThree.name = 'test tag three';
                tagThree.creator = creatorThree;
                tagFour.name = 'test tag four';
                tagFour.creator = creatorFour;
                product.name = 'test product';
                categoryOne.name = 'test category one';
                categoryTwo.name = 'test category two';
                categoryThree.name = 'test category three';
                product.categories = new ArrayCollection_1.ArrayCollection;
                product.image = image;
                image.tags = new ArrayCollection_1.ArrayCollection;
                categoryThree.tags = new ArrayCollection_1.ArrayCollection;
                categoryThree.id = 6;
                categoryThree.tags.push(tagThree, tagFour);
                unitOfWork.registerClean(categoryThree, true);
                unitOfWork.registerClean(creatorThree, true);
                unitOfWork.registerClean(tagThree, true);
                unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, categoryThree, 'tags', tagThree);
                unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, categoryThree, 'tags', tagFour);
                unitOfWork.registerDirty(tagThree, 'name');
                product.categories.push(categoryOne, categoryTwo, categoryThree);
                image.tags.push(tagOne, tagTwo);
                entityManager.persist(product);
                chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 1);
                chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 1);
                entityManager.flush().then(() => {
                    entityManager.getRepository(user_1.User).findOne({ name: 'test tag one creator' }, { join: { 'profile': 'p' } })
                        .then(user => {
                        chai_1.assert.strictEqual(user.profile.slogan, 'No harm, try harder.');
                        wetland.destroyConnections().then(() => {
                            done();
                        });
                    });
                }).catch(done);
            });
        });
    });
});
