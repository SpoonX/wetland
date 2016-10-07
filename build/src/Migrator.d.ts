import { Wetland } from './Wetland';
import { SchemaBuilder } from './SchemaBuilder';
export declare class Migrator {
    /**
     * @type {Wetland}
     */
    private wetland;
    /**
     * @type {Scope}
     */
    private manager;
    /**
     * @type {SchemaBuilder}
     */
    private schemaBuilder;
    /**
     *
     * @param {Wetland} wetland
     */
    constructor(wetland: Wetland);
    /**
     * Create your database schema.
     *
     * @returns {SchemaBuilder}
     */
    create(): SchemaBuilder;
}
