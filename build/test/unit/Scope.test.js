"use strict";
const chai_1 = require('chai');
const EntityManager_1 = require('../../src/EntityManager');
const Wetland_1 = require('../../src/Wetland');
const Scope_1 = require('../../src/Scope');
const UnitOfWork_1 = require('../../src/UnitOfWork');
const Simple_1 = require('../resource/entity/Simple');
const EntityRepository_1 = require('../../src/EntityRepository');
const WithCustomRepository_1 = require('../resource/entity/WithCustomRepository');
const CustomRepository_1 = require('../resource/repository/CustomRepository');
function entityManager(entities) {
    let entityManager = new EntityManager_1.EntityManager(new Wetland_1.Wetland({}));
    if (entities) {
        entityManager.registerEntities(entities);
    }
    return entityManager;
}
describe('Scope', () => {
    describe('.constructor()', () => {
        it('should take an entity manager', () => {
            new Scope_1.Scope(entityManager());
        });
    });
    describe('.getRepository()', () => {
        it('should return a default repository', () => {
            let scope = new Scope_1.Scope(entityManager([Simple_1.Simple]));
            chai_1.assert.instanceOf(scope.getRepository(Simple_1.Simple), EntityRepository_1.EntityRepository);
        });
        it('should return a custom repository', () => {
            let scope = new Scope_1.Scope(entityManager([WithCustomRepository_1.WithCustomRepository]));
            chai_1.assert.instanceOf(scope.getRepository(WithCustomRepository_1.WithCustomRepository), EntityRepository_1.EntityRepository);
            chai_1.assert.instanceOf(scope.getRepository(WithCustomRepository_1.WithCustomRepository), CustomRepository_1.CustomRepository);
        });
    });
    describe('.getUnitOfWork()', () => {
        it('should return the UnitOfWork', () => {
            let scope = new Scope_1.Scope(entityManager());
            chai_1.assert.instanceOf(scope.getUnitOfWork(), UnitOfWork_1.UnitOfWork);
        });
    });
    describe('.persist()', () => {
        it('should add the entity to the unitOfWork', () => {
            let scope = new Scope_1.Scope(entityManager([Simple_1.Simple]));
            let simple = new Simple_1.Simple;
            scope.persist(simple);
            chai_1.assert.strictEqual(scope.getUnitOfWork().getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_NEW);
        });
        it('should return Scope', () => {
            let scope = new Scope_1.Scope(entityManager([Simple_1.Simple]));
            chai_1.assert.strictEqual(scope.persist(new Simple_1.Simple), scope);
        });
    });
    describe('.remove()', () => {
        it('should add the entity to the unitOfWork as "deleted"', () => {
            let scope = new Scope_1.Scope(entityManager([Simple_1.Simple]));
            let simple = new Simple_1.Simple;
            scope.remove(simple);
            chai_1.assert.strictEqual(scope.getUnitOfWork().getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_DELETED);
        });
        it('should return Scope', () => {
            let scope = new Scope_1.Scope(entityManager([Simple_1.Simple]));
            chai_1.assert.strictEqual(scope.remove(new Simple_1.Simple), scope);
        });
    });
    describe('.clear()', () => {
        it('should reset the unit of work', () => {
            let scope = new Scope_1.Scope(entityManager([Simple_1.Simple]));
            let simple = new Simple_1.Simple;
            scope.remove(simple);
            chai_1.assert.strictEqual(scope.getUnitOfWork().getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_DELETED);
            scope.clear();
            chai_1.assert.strictEqual(scope.getUnitOfWork().getObjectState(simple), UnitOfWork_1.UnitOfWork.STATE_CLEAN);
        });
    });
});
