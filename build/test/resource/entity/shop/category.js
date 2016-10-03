"use strict";
class Category {
    static setMapping(mapping) {
        mapping.field('id', { type: 'integer' }).id('id').generatedValue('id', 'autoIncrement');
        mapping.field('name', { type: 'string', size: 24 });
        mapping.manyToMany('products', { targetEntity: 'Product', mappedBy: 'categories' });
        mapping
            .cascade('tags', ['persist'])
            .manyToMany('tags', { targetEntity: 'Tag', inversedBy: 'categories' });
    }
}
exports.Category = Category;
