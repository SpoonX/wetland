"use strict";
const Mapping_1 = require("../Mapping");
/**
 * Decorate a property as a field. Examples:
 *
 *  - Default (property) name
 *    @field('username', {type: 'string', length: 255})
 *    username: string;
 *
 *  - Custom name
 *    @field('password', {type: 'string', name: 'passwd'})
 *    password: string;
 *
 * @param {{}} options
 *
 * @return {Mapping}
 */
function field(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).field(property, options);
    };
}
exports.field = field;
/**
 * Decorate an entity. Examples:
 *
 *  - Default name and repository
 *    @entity()
 *    class Foo {}
 *
 *  - Custom name and repository
 *    @entity({repository: MyRepository, name: 'custom'})
 *    class Foo {}
 *
 * @param {{}} [options]
 *
 * @return {Mapping}
 */
function entity(options) {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).entity(options);
    };
}
exports.entity = entity;
/**
 * Decorate your entity with an index. Examples:
 *
 *  - Compound
 *    @index('idx_something', ['property1', 'property2'])
 *
 *  - Single
 *    @index('idx_something', ['property'])
 *    @index('idx_something', 'property')
 *
 *  - Generated index name "idx_property"
 *    @index('property')
 *    @index(['property1', 'property2'])
 *
 * @param {Array|string} indexName
 * @param {Array|string} [fields]
 *
 * @return {Mapping}
 */
function index(indexName, fields) {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).index(indexName, fields);
    };
}
exports.index = index;
/**
 * Decorate a property to be the primary key. Example:
 *
 *  @id('id')
 *  public id: number;
 *
 * @return {Mapping}
 */
function id() {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).id(property);
    };
}
exports.id = id;
/**
 * Decorate your property with generatedValues. Example:
 *
 *  @generatedValue('autoIncrement')
 *  public id: number;
 *
 * @param {string} type
 *
 * @return {Mapping}
 */
function generatedValue(type) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).generatedValue(property, type);
    };
}
exports.generatedValue = generatedValue;
/**
 * Decorate your entity with a uniqueConstraint
 *
 *  - Compound:
 *    @uniqueConstraint('something_unique', ['property1', 'property2'])
 *
 *  - Single:
 *    @uniqueConstraint('something_unique', ['property'])
 *    @uniqueConstraint('something_unique', 'property')
 *
 *  - Generated uniqueConstraint name:
 *    @uniqueConstraint('property')
 *    @uniqueConstraint(['property1', 'property2'])
 *
 * @param {Array|string} constraintName
 * @param {Array|string} [fields]
 *
 * @return {Function}
 */
function uniqueConstraint(constraintName, fields) {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).uniqueConstraint(constraintName, fields);
    };
}
exports.uniqueConstraint = uniqueConstraint;
