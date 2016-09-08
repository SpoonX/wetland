"use strict";
const MetaData_1 = require("../../src/MetaData");
describe('MetaData', () => {
    describe('static .forTarget()', () => {
        it('should return the same instance with all forms of the target', () => {
            class Foo {
            }
            let meta = MetaData_1.MetaData.forTarget(Foo);
            let a = new Foo();
            let metaTwo = MetaData_1.MetaData.forInstance(a);
            let dirty = metaTwo.fetchOrPut(`entityState.dirty.Foo`, []);
            dirty.push('foo');
            dirty.push('bar');
            // meta.put('foo', 'bar');
        });
    });
});
