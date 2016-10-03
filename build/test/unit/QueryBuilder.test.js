"use strict";
const Wetland_1 = require('../../src/Wetland');
const chai_1 = require('chai');
const queries_1 = require('../resource/queries');
describe('QueryBuilder', () => {
    describe('.commit()', () => {
        it('should persist all the changes properly (aka the shit-show-but-with-persist-as-well test)', done => {
            let wetland = new Wetland_1.Wetland({
                stores: {
                    'default': {
                        client: 'mysql',
                        connection: {
                            user: 'root',
                            database: 'wetland'
                        }
                    }
                },
                entities: [Product, Category, Image, Tag, User, Profile]
            });
            let queryOptions = {
                debug: true,
                alias: 'p',
                join: ['categories', 'author', 'image', 'image.tags', 'tags.creator', 'creator.products', { 'products.categories': 'cc' }]
            };
            manager.getRepository(Product).find({ 'creator.name': 'Wesley' }, queryOptions);
            chai_1.assert.equal(queries_1.queries.veryDeepJoins);
        });
    });
});
