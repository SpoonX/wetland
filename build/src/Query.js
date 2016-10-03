"use strict";
class Query {
    /**
     * Construct a new Query.
     *
     * @param {knex.QueryBuilder} statement
     * @param {Hydrator}          hydrator
     */
    constructor(statement, hydrator) {
        this.statement = statement;
        this.hydrator = hydrator;
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
        return this.execute().then(result => this.hydrator.hydrateAll(result));
    }
    /**
     * Get the SQL query for current query.
     *
     * @returns {string}
     */
    getSQL() {
        return this.statement.toString();
    }
    /**
     * Get the statement for this query.
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement() {
        return this.statement;
    }
}
exports.Query = Query;
