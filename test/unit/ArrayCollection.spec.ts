import { ArrayCollection } from '../../src/ArrayCollection';
import { assert } from 'chai';


describe('ArrayCollection', () => {
  describe('.add()', () => {
    it('should add an item to the collection', () => {
      let collection = new ArrayCollection;

      assert.isArray(collection);
      collection.add('foo');
      collection.add('foo');
      assert.equal(collection[0], 'foo');
      assert.isUndefined(collection[1]);
      collection.add('foo', 'foo', 'foo');
      assert.equal(collection[0], 'foo');
      assert.isUndefined(collection[1]);
      collection.add('bar');
      assert.equal(collection[1], 'bar');
    });

    it('should return this (ArrayCollection)', () => {
      let collection = new ArrayCollection;

      assert.strictEqual(collection.add('foo'), collection);
    });
  });

  describe('.remove', () => {
    it('should remove an item from the collection', () => {
      let collection = new ArrayCollection;

      collection.add('foo');
      assert.equal(collection[0], 'foo');
      collection.remove('foo');
      assert.isUndefined(collection[0]);
    });

    it('should return this (ArrayCollection)', () => {
      let collection = new ArrayCollection;

      assert.strictEqual(collection.remove('foo'), collection);
    });
  });
});
