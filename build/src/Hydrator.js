"use strict";
const Mapping_1 = require('./Mapping');
class Hydrator {
    static hydrate(entity, values) {
        if (!values) {
            return Hydrator.fromSchema(entity, values);
        }
        return Hydrator.toSchema(entity);
    }
    static fromSchema(values, EntityClass) {
        let mapping = Mapping_1.Mapping.forEntity(EntityClass);
        let entity = new EntityClass();
        Object.getOwnPropertyNames(values).forEach(column => {
            let property = mapping.getPropertyName(column);
            if (!property) {
                return;
            }
            entity[property] = values[column];
        });
        return entity;
    }
    static toSchema(entity) {
        let mapping = Mapping_1.Mapping.forEntity(entity);
        let mappedValues;
        if (Array.isArray(entity)) {
            mappedValues = [];
            entity.forEach(value => {
                mappedValues.push(this.mapToColumns(value));
            });
            return mappedValues;
        }
        mappedValues = {};
        Object.getOwnPropertyNames(entity).forEach(property => {
            let fieldName = this.criteria.mapToColumn(property);
            if (!fieldName) {
                throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
            }
            mappedValues[fieldName] = entity[property];
        });
        return mappedValues;
    }
}
exports.Hydrator = Hydrator;
//
// public mapToColumn(key) {
//   if (key.indexOf('.') > -1) {
//     let parts = key.split('.');
//     parts[1]  = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);
//
//     return parts.join('.');
//   }
//
//   return this.hostMapping.getFieldName(key, key);
// }
