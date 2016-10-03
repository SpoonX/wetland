"use strict";
class User {
    static setMapping(mapping) {
        mapping.field('id', { type: 'integer' }).id('id').generatedValue('id', 'autoIncrement');
        mapping.field('name', { type: 'string', size: 24 });
        mapping
            .oneToMany('products', { targetEntity: 'Product', mappedBy: 'author' })
            .cascade('products', ['persist']);
        mapping.oneToMany('tags', { targetEntity: 'Tag', mappedBy: 'creator' });
        mapping.cascade('profile', ['persist']).oneToOne('profile', { targetEntity: 'Profile' });
    }
}
exports.User = User;
