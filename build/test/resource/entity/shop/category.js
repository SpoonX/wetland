"use strict";
class Category {
    static setMapping(mapping) {
        mapping.forProperty('id')
            .field({ type: 'integer' })
            .generatedValue('autoIncrement')
            .primary();
        mapping.field('name', { type: 'string', size: 24 });
        mapping.manyToMany('products', { targetEntity: 'Product', mappedBy: 'categories' });
        mapping.forProperty('tags')
            .cascade(['persist'])
            .manyToMany({ targetEntity: 'Tag', inversedBy: 'categories' });
    }
}
exports.Category = Category;
