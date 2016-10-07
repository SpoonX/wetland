"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Wetland_1 = require('../../src/Wetland');
const category_1 = require('../resource/entity/shop/category');
const product_1 = require('../resource/entity/shop/product');
const image_1 = require('../resource/entity/shop/image');
const Profile_1 = require('../resource/entity/shop/Profile');
const tag_1 = require('../resource/entity/shop/tag');
const user_1 = require('../resource/entity/shop/user');
const Mapping_1 = require('../../src/Mapping');
function getEntityManager(entities) {
    let wetland = new Wetland_1.Wetland({});
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland.getManager();
}
describe('SchemaBuilder', () => {
    describe('.create()', () => {
        it('should create my tables', () => __awaiter(this, void 0, void 0, function* () {
            let entityManager = getEntityManager([category_1.Category, product_1.Product, image_1.Image, Profile_1.Profile, tag_1.Tag, user_1.User]);
            let entities = entityManager.getEntities();
            let mappings = Object.keys(entities).map(entity => Mapping_1.Mapping.forEntity(entities[entity]));
            // @todo test the shit out of this!
            // let schemaBuilder = new SchemaBuilder(entityManager, schemaBuilder: Knex.SchemaBuilder, mapping: Mapping<EntityInterface>);
        }));
    });
});
