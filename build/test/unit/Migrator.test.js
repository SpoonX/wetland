"use strict";
const Wetland_1 = require('../../src/Wetland');
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
            done();
        });
    });
});
