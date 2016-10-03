"use strict";
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
        it('should accept a statement, mapping and optionally mappings for aliases', done => {
            done();
            // @todo implement
            // let store      = new Store('testStore', storeConnection('constructor'));
            // let connection = store.getConnection()();
            //
            // new Criteria(connection, Mapping.forEntity(Simple));
        });
    });
    describe('.apply()', () => {
        it('should apply provided simple criteria to provided statement', () => {
            // let store      = new Store('testStore', storeConnection('constructor'));
            // let connection = store.getConnection()('foo');
            // let criteria   = new Criteria(connection, Mapping.forEntity(Simple));
            //
            // criteria.apply({
            //   foo   : 'bar',
            //   active: true
            // }, connection);
            //
            // connection.count('cake').as('asd');
            //
            // console.log(connection.toString());
        });
    });
});
