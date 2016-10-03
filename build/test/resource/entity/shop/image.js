"use strict";
class Image {
    static setMapping(mapping) {
        mapping.field('id', { type: 'integer' }).id('id').generatedValue('id', 'autoIncrement');
        mapping.field('name', { type: 'string', size: 24 });
        mapping.field('type', { type: 'string', size: 24 });
        mapping.field('location', { type: 'string', size: 24 });
        mapping
            .manyToOne('author', { targetEntity: 'User', inversedBy: 'products' })
            .joinColumn('author', { name: 'author_id', referencedColumnName: 'id' });
        mapping
            .cascade('tags', ['persist'])
            .manyToMany('tags', { targetEntity: 'Tag', inversedBy: 'images' });
    }
}
exports.Image = Image;
