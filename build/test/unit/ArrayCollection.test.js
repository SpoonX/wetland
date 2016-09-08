"use strict";
const ArrayCollection_1 = require('../../src/ArrayCollection');
const chai_1 = require('chai');
describe('ArrayCollection', () => {
    describe('.add()', () => {
        it('should add an item to the collection', () => {
            let collection = new ArrayCollection_1.ArrayCollection;
            chai_1.assert.isArray(collection);
            collection.add('foo');
            collection.add('foo');
            chai_1.assert.equal(collection[0], 'foo');
            chai_1.assert.isUndefined(collection[1]);
            collection.add('foo', 'foo', 'foo');
            chai_1.assert.equal(collection[0], 'foo');
            chai_1.assert.isUndefined(collection[1]);
            collection.add('bar');
            chai_1.assert.equal(collection[1], 'bar');
        });
        it('should return this (ArrayCollection)', () => {
            let collection = new ArrayCollection_1.ArrayCollection;
            chai_1.assert.strictEqual(collection.add('foo'), collection);
        });
    });
    describe('.remove', () => {
        it('should remove an item from the collection', () => {
            let collection = new ArrayCollection_1.ArrayCollection;
            collection.add('foo');
            chai_1.assert.equal(collection[0], 'foo');
            collection.remove('foo');
            chai_1.assert.isUndefined(collection[0]);
        });
        it('should return this (ArrayCollection)', () => {
            let collection = new ArrayCollection_1.ArrayCollection;
            chai_1.assert.strictEqual(collection.remove('foo'), collection);
        });
    });
});
