"use strict";
class User {
    static setMapping(mapping) {
        mapping.uniqueConstraint('lonely_name', 'name');
        mapping.forProperty('id').primary().generatedValue('autoIncrement');
        mapping.field('name', { type: 'string', size: 24, name: 'custom' });
        mapping
            .oneToMany('products', { targetEntity: 'Product', mappedBy: 'author' })
            .cascade('products', ['persist']);
        mapping.oneToMany('tags', { targetEntity: 'Tag', mappedBy: 'creator' });
        mapping.cascade('profile', ['persist', 'delete']).oneToOne('profile', { targetEntity: 'Profile' });
    }
}
exports.User = User;
