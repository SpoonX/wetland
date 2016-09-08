"use strict";
const Mapping_1 = require("../../src/Mapping");
const EntityRepository_1 = require("../../src/EntityRepository");
const resource = require("../resource/decorator/index");
class Bar extends EntityRepository_1.EntityRepository {
}
describe('Mapping', () => {
    describe('static .forEntity()', () => {
        let mapping = Mapping_1.Mapping.forEntity(resource.Field);
        class Group {
        }
        class User {
        }
        // mapping.manyToMany('groups', {
        //   targetEntity: Group,
        //   inversedBy  : 'users',
        //   cascade     : ['persist', 'remove']
        // });
        //
        // mapping.throughEntity({
        //   name: 'group_user',
        //   joinColumns: [{name: 'group_id', referencedColumnName: 'id'}],
        //   inverseJoinColumns: [{name: 'user_id', referencedColumnName: 'id'}]
        // });
        //
        //
        //
        // mapping.manyToMany('users', {
        //   targetEntity: User,
        //   mappedBy: 'groups'
        // });
        // console.log(mapping.mapping.data);
    });
});
