"use strict";
const UnitOfWork_1 = require('./UnitOfWork');
const ArrayCollection_1 = require('./ArrayCollection');
const Mapping_1 = require('./Mapping');
const MetaData_1 = require('./MetaData');
class EntityProxy {
    /**
     * Patch provided entity with a proxy to track changes.
     *
     * @param {EntityInterface} entity
     * @param {Scope}           entityManager
     *
     * @returns {Object}
     */
    static patchEntity(entity, entityManager) {
        // Don't re-patch an entity.
        if (entity['isEntityProxy']) {
            return entity;
        }
        let proxyActive = false;
        let metaData = MetaData_1.MetaData.forInstance(entity);
        let mapping = Mapping_1.Mapping.forEntity(entity);
        let unitOfWork = entityManager.getUnitOfWork();
        let relations = mapping.getRelations();
        let expected = {};
        let entityProxy;
        // Create collection observers
        if (relations) {
            Object.getOwnPropertyNames(relations).forEach(property => {
                let type = relations[property].type;
                if (type === Mapping_1.Mapping.RELATION_ONE_TO_MANY || type === Mapping_1.Mapping.RELATION_MANY_TO_MANY) {
                    proxyCollection(property);
                }
            });
        }
        /**
         * @returns {boolean}
         */
        function isProxyActive() {
            return proxyActive && metaData.fetch('entityState.state') !== UnitOfWork_1.UnitOfWork.STATE_UNKNOWN;
        }
        /**
         * Allow lazy loading and caching expected relations.
         *
         * @param {string} property
         *
         * @returns {any}
         */
        function getExpected(property) {
            if (!expected[property]) {
                expected[property] = entityManager.resolveEntityReference(relations[property].targetEntity);
            }
            return expected[property];
        }
        /**
         * Proxy a collection.
         *
         * @param {string}  property   Where does this collection live?
         * @param {boolean} [forceNew] Replace whatever is set with new collection. defaults to false.
         *
         * @returns {void}
         */
        function proxyCollection(property, forceNew = false) {
            // Define what this collection consists out of.
            let ExpectedEntity = getExpected(property);
            let collection = (forceNew || !entity[property]) ? new ArrayCollection_1.ArrayCollection : entity[property];
            // Create a new proxy, and ensure there's an existing collection.
            entity[property] = new Proxy(collection, {
                set: (collection, key, relationEntity) => {
                    collection[key] = relationEntity;
                    // If it's not a number, or we're not observing, just return.
                    if (isNaN(parseInt(key, 10)) || !isProxyActive()) {
                        return true;
                    }
                    if (typeof relationEntity !== 'object' || !(relationEntity instanceof ExpectedEntity)) {
                        throw new TypeError(`Can't add to '${entity.constructor.name}.${property}'. Expected instance of '${ExpectedEntity.name}'.`);
                    }
                    // Alright, let's stage this as a new relationship change.
                    unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, entityProxy, property, relationEntity);
                    return true;
                },
                get: (target, property) => {
                    if (property === 'isCollectionProxy') {
                        return true;
                    }
                    return target[property];
                },
                deleteProperty: (collection, key) => {
                    if (isProxyActive()) {
                        console.log(key, collection[key]);
                        unitOfWork.registerCollectionChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, entityProxy, property, collection[key]);
                    }
                    collection.splice(parseInt(key, 10), 1);
                    return true;
                }
            });
        }
        // Return the actual proxy for the entity.
        entityProxy = new Proxy(entity, {
            set: (target, property, value) => {
                // Allow all dirty checks to be skipped.
                if (typeof value === 'object' && value !== null && '_skipDirty' in value) {
                    target[property] = value._skipDirty;
                    return true;
                }
                // If there's no relation, or the proxy isn't active, just set value.
                if (!relations || !relations[property] || !isProxyActive()) {
                    unitOfWork.registerDirty(target, property);
                    target[property] = value;
                    return true;
                }
                // To many? Only allowed if collection is empty. Also, ensure this new collection is proxied.
                if (entity[property] instanceof ArrayCollection_1.ArrayCollection) {
                    if (entity[property].length > 0) {
                        throw new Error(`Can't assign to '${target.constructor.name}.${property}'. Collection is not empty.`);
                    }
                    proxyCollection(property, true);
                    return true;
                }
                // Ensure provided value is of the type we expect for the relationship.
                let ExpectedEntity = getExpected(property);
                if (!(value instanceof ExpectedEntity)) {
                    throw new TypeError(`Can't assign to '${target.constructor.name}.${property}'. Expected instance of '${ExpectedEntity.name}'.`);
                }
                // If we already hold a value, stage its removal it.
                if (target[property]) {
                    unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, entityProxy, property, target[property]);
                }
                // Now set provided entity as new.
                unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_ADDED, entityProxy, property, value);
                // Ensure that new relation is also being watched for changes, and set.
                target[property] = EntityProxy.patchEntity(value, entityManager);
                return true;
            },
            get: (target, property) => {
                let methods = {
                    isEntityProxy: true,
                    activateProxying: () => {
                        proxyActive = true;
                        return this;
                    },
                    deactivateProxying: () => {
                        proxyActive = false;
                        return this;
                    },
                    getTarget: () => {
                        return entity;
                    },
                    isProxyingActive: () => {
                        return isProxyActive();
                    }
                };
                if (methods[property]) {
                    return methods[property];
                }
                return target[property];
            },
            deleteProperty: (target, property) => {
                if (target[property] instanceof ArrayCollection_1.ArrayCollection) {
                    throw new Error(`It is not allowed to delete a collection. Trying to delete '${target.constructor.name}.${property}'.`);
                }
                unitOfWork.registerRelationChange(UnitOfWork_1.UnitOfWork.RELATIONSHIP_REMOVED, entityProxy, property, target[property]);
                delete target[property];
                return true;
            }
        });
        return entityProxy;
    }
}
exports.EntityProxy = EntityProxy;
