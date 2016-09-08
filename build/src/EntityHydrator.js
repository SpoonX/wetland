"use strict";
const Mapping_1 = require('./Mapping');
class EntityHydrator {
    /**
     * Hydrate a database result into an entity.
     *
     * @param {Object} values
     * @param {{new ()}| Function} EntityClass
     *
     * @returns {EntityInterface}
     */
    static fromSchema(values, EntityClass) {
        let mapping = Mapping_1.Mapping.forEntity(EntityClass);
        let entity = typeof EntityClass === 'function' ? new EntityClass : EntityClass;
        Object.getOwnPropertyNames(values).forEach(column => {
            let property = mapping.getPropertyName(column);
            if (!property) {
                return;
            }
            entity[property] = values[column];
        });
        return entity;
    }
}
exports.EntityHydrator = EntityHydrator;
