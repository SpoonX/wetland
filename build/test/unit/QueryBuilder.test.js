let exampleCriteria = {
    name: 'foo',
    or: [],
    and: [],
    city: {
        like: 'amsterd%' // Mapped directly
    },
    country: {
        contains: 'land' // % value %
    },
    status: {
        gt: 0
    },
    group: {
        name: 'admin',
        active: true
    },
    categories: {
        and: [],
        type: 'tech',
        active: { '>': 0 }
    }
};
// import {QueryBuilder} from "../../src/QueryBuilder";
// import * as Knex from 'knex';
//
// function getConnection(table) {
//   return Knex({client: 'mysql'})(table);
// }
//
// describe('QueryBuilder', () => {
//   describe('.matching()', () => {
//     let queryBuilder = new QueryBuilder(getConnection('foo'));
//   });
// });
