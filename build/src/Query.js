"use strict";
const EntityProxy_1 = require('./EntityProxy');
const EntityHydrator_1 = require('./EntityHydrator');
class Query {
    /**
     * Construct a new Query.
     *
     * @param {knex.QueryBuilder} statement
     * @param {Scope}             entityManager
     */
    constructor(statement, entityManager) {
        this.statement = statement;
        this.entityManager = entityManager;
    }
    /**
     * Get the statement (knex instance).
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement() {
        return this.statement;
    }
    /**
     * Set mappings.
     *
     * @param {{}} mappings
     *
     * @returns {Query} Fluent interface
     */
    setMappings(mappings) {
        this.mappings = mappings;
        return this;
    }
    /**
     * Set the alias for the host.
     *
     * @param {string} alias
     *
     * @returns {Query}
     */
    setAlias(alias) {
        this.alias = alias;
        return this;
    }
    /**
     * Execute the query.
     *
     * @returns {Promise<[]>}
     */
    execute() {
        return this.statement.then();
    }
    /**
     * Get a single scalar result (for instance for count, sum or max).
     *
     * @returns {Promise<number>}
     */
    getSingleScalarResult() {
        return this.execute().then(result => {
            if (!result || typeof result[0] !== 'object') {
                return null;
            }
            return result[0][Object.keys(result[0])[0]];
        });
    }
    /**
     * Get the result for the query.
     *
     * @returns {Promise<{}[]>}
     */
    getResult() {
        return this.execute().then(result => this.hydrateEntities(result, this.alias));
    }
    /**
     * Hydrate provided rows to entities.
     *
     * @param {{}[]}   rows
     * @param {string} alias
     *
     * @returns {{}[]}
     */
    hydrateEntities(rows, alias) {
        return rows.map(row => this.hydrateEntity(row, alias));
    }
    /**
     * Hydrate an entity.
     *
     * @param {{}}     row
     * @param {string} alias
     *
     * @returns {{}}
     */
    hydrateEntity(row, alias) {
        let EntityClass = this.entityManager.getEntity(this.mappings[alias].getEntityName());
        return EntityProxy_1.EntityProxy.patch(EntityHydrator_1.EntityHydrator.fromSchema(row, EntityClass), this.entityManager.getUnitOfWork());
    }
    /**
     * Get the SQL query for current query.
     *
     * @returns {string}
     */
    getSQL() {
        return this.statement.toString();
    }
}
exports.Query = Query;
