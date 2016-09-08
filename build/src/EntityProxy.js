"use strict";
class EntityProxy {
    /**
     * Patch provided entity with a proxy to track changes.
     *
     * @param {EntityInterface} entity
     * @param {UnitOfWork}      unitOfWork
     *
     * @returns {Object}
     */
    static patch(entity, unitOfWork) {
        return new Proxy(entity, {
            set: (target, property, value) => {
                unitOfWork.registerDirty(target, property);
                target[property] = value;
            }
        });
    }
}
exports.EntityProxy = EntityProxy;
