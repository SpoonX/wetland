"use strict";
const ArrayCollection_1 = require('../../../src/ArrayCollection');
const Simple_1 = require('./Simple');
class Parent {
    constructor() {
        this.simples = new ArrayCollection_1.ArrayCollection();
        this.others = new ArrayCollection_1.ArrayCollection();
    }
    static setMapping(mapping) {
        mapping.oneToMany('simples', { targetEntity: Simple_1.Simple, mappedBy: 'parent' });
        mapping.oneToOne('single', { targetEntity: Simple_1.Simple });
    }
}
exports.Parent = Parent;
