"use strict";
const Scope_1 = require('./Scope');
class Manager {
    createScope() {
        return new Scope_1.Scope(this);
    }
    getRepository(Entity) {
    }
}
exports.Manager = Manager;
