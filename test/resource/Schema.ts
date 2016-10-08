import * as knex from 'knex';

export class Schema {
  static getColumns(connection, table?) {
    return Schema.getData(connection, false, [
      'column_default',
      'table_name',
      'column_name',
      'data_type',
      'extra',
      'column_key',
      'column_type',
      'is_nullable'
    ], 'columns', null, table);
  }

  static getAllInfo(connection, table?) {
    return Promise.all([
      Schema.getColumns(connection, table),
      Schema.getConstraints(connection, table),
      Schema.getReferentialConstraints(connection, table)
    ]).then(results => {
      return {
        columns               : results[0],
        constraints           : results[1],
        referentialConstraints: results[2]
      };
    })
  }

  static resetDatabase(done) {
    let connection = knex({
      client    : 'mysql',
      connection: {
        user    : 'root',
        host    : '127.0.0.1',
        database: 'wetland_test'
      }
    });

    connection.raw('drop database wetland_test').then(function() {
      return connection.raw('create database wetland_test').then(() => {
        connection.destroy().then(() => {
          done();
        });
      });
    });
  }

  static getReferentialConstraints(connection, table?) {
    return Schema.getData(connection, true, [
      'constraint_name',
      'unique_constraint_schema',
      'unique_constraint_name',
      'update_rule',
      'delete_rule',
      'table_name',
      'referenced_table_name',
    ], 'referential_constraints', null, table);
  }

  static getConstraints(connection, table?) {
    return Schema.getData(connection, true, [
      'table_name',
      'column_name',
      'constraint_name',
      'referenced_table_name',
      'referenced_column_name'
    ], 'key_column_usage', 'column_name', table);
  }

  static getData(connection, constraint, select, from, orderBy, table?) {
    let query = connection
      .select(select)
      .from('information_schema.' + from)
      .where({[constraint ? 'constraint_schema' : 'table_schema']: 'wetland_test'})
      .orderBy('table_name', 'asc');

    if (orderBy) {
      query.orderBy(orderBy);
    }

    if (table) {
      query.andWhere({referenced_table_name: table});
    }

    return query.then();
  }
}

