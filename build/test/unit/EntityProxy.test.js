"use strict";
const EntityProxy_1 = require('../../src/EntityProxy');
const chai_1 = require('chai');
const UnitOfWork_1 = require('../../src/UnitOfWork');
const Wetland_1 = require('../../src/Wetland');
const Simple_1 = require('../resource/entity/Simple');
const Parent_1 = require('../resource/entity/Parent');
const SimpleDifferent_1 = require('../resource/entity/SimpleDifferent');
function getUnitOfWork(entities) {
    let wetland = new Wetland_1.Wetland({});
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland.getManager().getUnitOfWork();
}
describe('EntityProxy', () => {
    describe('static .patchEntity()', () => {
        it('should patch an entity, and be disabled by default', () => {
            let unitOfWork = getUnitOfWork();
            let entityManager = unitOfWork.getEntityManager();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, entityManager);
            chai_1.assert.strictEqual(patched.isEntityProxy, true);
            chai_1.assert.strictEqual(patched.isProxyingActive(), false);
            unitOfWork.registerClean(patched.getTarget());
            patched.activateProxying();
            chai_1.assert.strictEqual(patched.isProxyingActive(), true);
        });
        it('should patch the collections on an un-patched entity', () => {
            let unitOfWork = getUnitOfWork([Parent_1.Parent]);
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            chai_1.assert.strictEqual(patched.simples['isCollectionProxy'], true);
        });
        it('should throw an error when an entity of the wrong type was supplied for one relation', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new SimpleDifferent_1.SimpleDifferent;
            unitOfWork.registerClean(parent);
            patched.activateProxying();
            chai_1.assert.throws(() => {
                patched.single = simple;
            }, "Can't assign to 'Parent.single'. Expected instance of 'Simple'.");
        });
        it('should throw an error when an entity of the wrong type was supplied for many relation', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new SimpleDifferent_1.SimpleDifferent;
            unitOfWork.registerClean(parent);
            patched.activateProxying();
            chai_1.assert.throws(() => {
                patched.simples.push(simple);
            }, "Can't add to 'Parent.simples'. Expected instance of 'Simple'.");
        });
        it('should register collection changes when adding an entity to a collection', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new Simple_1.Simple;
            let simpleTwo = new Simple_1.Simple;
            simple.name = 'hello';
            simpleTwo.name = 'world';
            patched.name = 'Simple test';
            unitOfWork.registerClean(parent);
            patched.activateProxying();
            chai_1.assert.deepEqual(unitOfWork.getRelationshipsChangedObjects(), []);
            patched.simples.add(simple);
            patched.simples.add(simpleTwo);
            chai_1.assert.deepEqual(unitOfWork.getRelationshipsChangedObjects(), [patched]);
        });
        it('should not register collection changes when re-adding an entity to a collection', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple = new Simple_1.Simple;
            simple.name = 'hello';
            parent.simples.push(simple);
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.STATE_UNKNOWN, UnitOfWork_1.UnitOfWork.getObjectState(patched));
            unitOfWork.registerClean(patched);
            patched.activateProxying();
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(patched), UnitOfWork_1.UnitOfWork.STATE_CLEAN);
            // Remove, make it dirty!
            patched.simples.pop();
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isDirty(patched));
            // Add again, clean it up.
            patched.simples.push(simple);
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isClean(patched));
            // Some different ways of adding / removing.
            patched.simples.splice(0, patched.simples.length);
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isDirty(patched));
            patched.simples[0] = simple;
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isClean(patched));
            delete patched.simples[0];
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isDirty(patched));
            patched.simples.unshift(simple);
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isClean(patched));
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(patched), UnitOfWork_1.UnitOfWork.STATE_CLEAN);
        });
    });
});
