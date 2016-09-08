"use strict";
const UnitOfWork_1 = require('../UnitOfWork');
class Scope {
    constructor(manager) {
        this.manager = manager;
        this.unitOfWork = new UnitOfWork_1.UnitOfWork;
    }
    getRepository(repository) {
        // return this.manager.getRepository(repository);
    }
    getUnitOfWork() {
        return this.unitOfWork;
    }
}
exports.Scope = Scope;
