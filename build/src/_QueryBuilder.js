"use strict";
/**
 * The Repository populates a QueryBuilder with the store responsible for provided Entity.
 * A store can have multiple connections, and can even have a master/slave setup.
 * All these connections are then assigned to tasks based on their role (master/slave) and provided strategy (defaults to RR, meaning Round Robin).
 * The store is responsible for returning the right connection for the task at hand.
 * Upon creation, the connection being returned is always a slave because QueryBuilders only support select statements publicly.
 * Internally, when getting a QueryBuilder, you have to specify if it has to be a read or write QueryBuilder, which is only applicable in a master/slave setup.
 *
 * A QueryBuilder uses the EntityManager to get a Query instance.
 * The reason for this is that the EntityManager is the only place that actually holds state.
 * The EntityManager injects a hydrator into the Query instance.
 * The QueryBuilder manipulates the query instance to have everything it needs (criteria, joins etc).
 * The Query instance allows you to dig through the results in a number of ways (get all, get scalar, get as stream etc).
 *
 * So, a custom repository can get a QueryBuilder instance, which will hold a Query instance, which then holds the hydrator (mapping) and a reference to the entity it's working for.
 * It will also hold a reference to an object that contains the aliases populated for the query.
 * The initial QueryBuilder will only implement a .matching() method, which allows you to pass in criteria as a compact object literal.
 * The QueryBuilder will then proxy those to the appropriate methods on the Query.
 *
 * The QueryBuilder will also expose .join() methods, for all join types.
 * This will both proxy, and store the alias of the table being joined.
 * These aliases, which have been passed to the Query instance as a reference, will be used to populate (hydrate) entities on a server response.
 * (mapping sql to in memory objects).
 *
 * On joins, I'll have to expand the scope of joinable entities.
 */
class QueryBuilder {
    /**
     * .getQueryBuilder('alias');
     *
     * @param entityManager
     * @param query
     * @param entity
     * @param alias
     */
    constructor(entityManager, query, entity, alias = null) {
        this.query = query;
        this.entity = entity;
        this.statement = query.getStatement();
        this.entityManager = entityManager;
    }
    getQuery() {
        return this.query;
    }
    select() {
        this.statement.select(...arguments);
        return this;
    }
    as() {
        this.statement.as(...arguments);
        return this;
    }
    columns() {
        this.statement.columns(...arguments);
        return this;
    }
    column() {
        this.statement.column(...arguments);
        return this;
    }
    from() {
        this.statement.from(...arguments);
        return this;
    }
    insert(values, returning) {
        this.statement.insert(values); // @todo add .into
    }
    into() {
        this.statement.into(...arguments);
        return this;
    }
    table() {
        this.statement.table(...arguments);
        return this;
    }
    distinct() {
        this.statement.distinct(...arguments);
        return this;
    }
    join() {
        this.statement.join(...arguments);
        return this;
    }
    joinRaw() {
        this.statement.joinRaw(...arguments);
        return this;
    }
    innerJoin() {
        this.statement.innerJoin(...arguments);
        return this;
    }
    leftJoin() {
        this.statement.leftJoin(...arguments);
        return this;
    }
    leftOuterJoin() {
        this.statement.leftOuterJoin(...arguments);
        return this;
    }
    rightJoin() {
        this.statement.rightJoin(...arguments);
        return this;
    }
    rightOuterJoin() {
        this.statement.rightOuterJoin(...arguments);
        return this;
    }
    outerJoin() {
        this.statement.outerJoin(...arguments);
        return this;
    }
    fullOuterJoin() {
        this.statement.fullOuterJoin(...arguments);
        return this;
    }
    crossJoin() {
        this.statement.crossJoin(...arguments);
        return this;
    }
    where() {
        this.statement.where(...arguments);
        return this;
    }
    andWhere() {
        this.statement.andWhere(...arguments);
        return this;
    }
    orWhere() {
        this.statement.orWhere(...arguments);
        return this;
    }
    whereNot() {
        this.statement.whereNot(...arguments);
        return this;
    }
    andWhereNot() {
        this.statement.andWhereNot(...arguments);
        return this;
    }
    orWhereNot() {
        this.statement.orWhereNot(...arguments);
        return this;
    }
    whereRaw() {
        this.statement.whereRaw(...arguments);
        return this;
    }
    orWhereRaw() {
        this.statement.orWhereRaw(...arguments);
        return this;
    }
    andWhereRaw() {
        this.statement.andWhereRaw(...arguments);
        return this;
    }
    whereWrapped() {
        this.statement.whereWrapped(...arguments);
        return this;
    }
    havingWrapped() {
        this.statement.havingWrapped(...arguments);
        return this;
    }
    whereExists() {
        this.statement.whereExists(...arguments);
        return this;
    }
    orWhereExists() {
        this.statement.orWhereExists(...arguments);
        return this;
    }
    whereNotExists() {
        this.statement.whereNotExists(...arguments);
        return this;
    }
    orWhereNotExists() {
        this.statement.orWhereNotExists(...arguments);
        return this;
    }
    whereIn() {
        this.statement.whereIn(...arguments);
        return this;
    }
    orWhereIn(whereIn) {
        this.statement.orWhereIn(whereIn);
        return this;
    }
    whereNotIn(columnName, values) {
        this.statement.whereNotIn(columnName, values);
        return this;
    }
    orWhereNotIn() {
        this.statement.orWhereNotIn();
        return this;
    }
    whereNull() {
        this.statement.whereNull(...arguments);
        return this;
    }
    orWhereNull() {
        this.statement.orWhereNull(...arguments);
        return this;
    }
    whereNotNull() {
        this.statement.whereNotNull(...arguments);
        return this;
    }
    orWhereNotNull() {
        this.statement.orWhereNotNull(...arguments);
        return this;
    }
    whereBetween() {
        this.statement.whereBetween(...arguments);
        return this;
    }
    orWhereBetween() {
        this.statement.orWhereBetween(...arguments);
        return this;
    }
    andWhereBetween() {
        this.statement.andWhereBetween(...arguments);
        return this;
    }
    whereNotBetween() {
        this.statement.whereNotBetween(...arguments);
        return this;
    }
    orWhereNotBetween() {
        this.statement.orWhereNotBetween(...arguments);
        return this;
    }
    andWhereNotBetween() {
        this.statement.andWhereNotBetween(...arguments);
        return this;
    }
    groupBy() {
        this.statement.groupBy(...arguments);
        return this;
    }
    groupByRaw() {
        this.statement.groupByRaw(...arguments);
        return this;
    }
    orderBy() {
        this.statement.orderBy(...arguments);
        return this;
    }
    orderByRaw() {
        this.statement.orderByRaw(...arguments);
        return this;
    }
    union() {
        this.statement.union(...arguments);
        return this;
    }
    having() {
        this.statement.having(...arguments);
        return this;
    }
    andHaving() {
        this.statement.andHaving(...arguments);
        return this;
    }
    havingRaw() {
        this.statement.havingRaw(...arguments);
        return this;
    }
    orHaving() {
        this.statement.orHaving(...arguments);
        return this;
    }
    orHavingRaw() {
        this.statement.orHavingRaw(...arguments);
        return this;
    }
    unionAll(callback) {
        this.statement.unionAll(...arguments);
        return this;
    }
    offset(offset) {
        this.statement.offset(...arguments);
        return this;
    }
    limit(limit) {
        this.statement.limit(limit);
        return this;
    }
    count(columnName) {
        this.statement.count(columnName);
        return this;
    }
    min(columnName) {
        this.statement.min(columnName);
        return this;
    }
    max(columnName) {
        this.statement.max(...arguments);
        return this;
    }
    sum(columnName) {
        this.statement.sum(...arguments);
        return this;
    }
    avg(columnName) {
        this.statement.avg(...arguments);
        return this;
    }
    increment(columnName, amount) {
        this.statement.increment(...arguments);
        return this;
    }
    decrement(columnName, amount) {
        this.statement.decrement(...arguments);
        return this;
    }
    first(columns) {
        this.statement.first(...arguments);
        return this;
    }
    debug(enabled) {
        this.statement.debug(...arguments);
        return this;
    }
    pluck(column) {
        this.statement.pluck(...arguments);
        return this;
    }
    update(data, returning) {
        this.statement.update(...arguments);
        return this;
    }
    update(columnName, value, returning) {
        this.statement.update(...arguments);
        return this;
    }
    returning(column) {
        this.statement.returning(...arguments);
        return this;
    }
    del(returning) {
        this.statement.del(...arguments);
        return this;
    }
    remove(returning) {
        this.statement.delete(...arguments);
        return this;
    }
    truncate() {
        this.statement.truncate();
        return this;
    }
    transacting(trx) {
        this.statement.transacting(...arguments);
        return this;
    }
    connection(connection) {
        this.statement.connection(...arguments);
        return this;
    }
    clone() {
        this.statement.clone();
        return this;
    }
    /**
     * @todo  perhaps this method could be the _only_ method that allows you to supply.
     *        Combined with other methods such as join and group by, we restrict access
     *        to a flexible minimum, maintaining control and preventing excessive methods.
     *        We could set up mappings based on keys, which might look something like this:
     *        - key: [1, 2] => having
     *        - or: {} => orWhere()
     *        - between: [] => whereBetween
     *        - or: {}
     *
     * @todo test if it's possible to nest multiple levels for where / or / and.
     *
     * @param criteria
     */
    matching(criteria) {
        Object.getOwnPropertyNames(criteria).forEach(property => {
            // @todo get the entities mapping, and use the column name here.
        });
    }
    soleMatch(criteria) {
    }
}
QueryBuilder.MODE_READ = 'read';
QueryBuilder.MODE_WRITE = 'write';
exports.QueryBuilder = QueryBuilder;
