"use strict";
const Criteria_1 = require('../../src/Criteria');
const Store_1 = require('../../src/Store');
const Mapping_1 = require('../../src/Mapping');
const Simple_1 = require('../resource/entity/Simple');
function storeConnection(name) {
    return {
        client: 'mysql',
        useNullAsDefault: true,
        connection: {
            user: 'root',
            database: 'testing'
        }
    };
}
describe('Criteria', () => {
    describe('.constructor()', () => {
        it('should accept a statement, mapping and optionally mappings for aliases', () => {
            let store = new Store_1.Store('testStore', storeConnection('constructor'));
            let connection = store.getConnection()();
            new Criteria_1.Criteria(connection, Mapping_1.Mapping.forEntity(Simple_1.Simple));
        });
    });
    describe('.apply()', () => {
        it('should apply provided simple criteria to provided statement', () => {
            let store = new Store_1.Store('testStore', storeConnection('constructor'));
            let connection = store.getConnection()('foo');
            let criteria = new Criteria_1.Criteria(connection, Mapping_1.Mapping.forEntity(Simple_1.Simple));
            criteria.apply({
                foo: 'bar',
                active: true
            }, connection);
            connection.count('cake').as('asd');
            console.log(connection.toString());
        });
    });
});
