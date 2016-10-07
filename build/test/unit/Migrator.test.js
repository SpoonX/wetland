"use strict";
const Wetland_1 = require('../../src/Wetland');
const category_1 = require('../resource/entity/shop/category');
const product_1 = require('../resource/entity/shop/product');
const image_1 = require('../resource/entity/shop/image');
const Profile_1 = require('../resource/entity/shop/Profile');
const tag_1 = require('../resource/entity/shop/tag');
const user_1 = require('../resource/entity/shop/user');
function getWetland(entities) {
    let wetland = new Wetland_1.Wetland({
        stores: {
            'default': {
                client: 'mysql',
                connection: {
                    user: 'root',
                    database: 'wetland'
                }
            }
        }
    });
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland;
}
function getEntityManager(entities) {
    let wetland = new Wetland_1.Wetland({});
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland.getManager();
}
describe('Migrator', () => {
    describe('.create()', () => {
        it('should create my tables', (done) => {
            let wetland = new Wetland_1.Wetland({
                entities: [category_1.Category, product_1.Product, image_1.Image, Profile_1.Profile, tag_1.Tag, user_1.User],
                stores: {
                    'default': {
                        client: 'mysql',
                        connection: {
                            user: 'root',
                            database: 'wetland'
                        }
                    }
                }
            });
            let migrator = wetland.getMigrator();
            console.log(migrator.create().getSQL());
        });
    });
});
