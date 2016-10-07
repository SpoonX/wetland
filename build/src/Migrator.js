"use strict";
const SchemaBuilder_1 = require('./SchemaBuilder');
class Migrator {
    /**
     *
     * @param {Wetland} wetland
     */
    constructor(wetland) {
        this.wetland = wetland;
        this.manager = wetland.getManager();
    }
    /**
     * Create your database schema.
     *
     * @returns {SchemaBuilder}
     */
    create() {
        if (!this.schemaBuilder) {
            this.schemaBuilder = new SchemaBuilder_1.SchemaBuilder(this.manager);
        }
        return this.schemaBuilder.create();
    }
}
exports.Migrator = Migrator;
