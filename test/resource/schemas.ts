export let schemas = {
  todo  : {
    columns               : [
      {
        column_default: null,
        table_name    : 'list',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'list',
        column_name   : 'name',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(255)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'list',
        column_name   : 'done',
        data_type     : 'tinyint',
        extra         : '',
        column_key    : '',
        column_type   : 'tinyint(1)',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'todo',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'todo',
        column_name   : 'task',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(255)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'todo',
        column_name   : 'done',
        data_type     : 'tinyint',
        extra         : '',
        column_key    : '',
        column_type   : 'tinyint(1)',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'todo',
        column_name   : 'list_id',
        data_type     : 'int',
        extra         : '',
        column_key    : 'MUL',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'todo',
        column_name   : 'creator_id',
        data_type     : 'int',
        extra         : '',
        column_key    : 'MUL',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'user',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'user',
        column_name   : 'name',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(24)',
        is_nullable   : 'NO'
      }
    ],
    constraints           : [
      {
        table_name            : 'list',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'todo',
        column_name           : 'creator_id',
        constraint_name       : 'todo_creator_id_foreign',
        referenced_table_name : 'user',
        referenced_column_name: 'id'
      },
      {
        table_name            : 'todo',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'todo',
        column_name           : 'list_id',
        constraint_name       : 'todo_list_id_foreign',
        referenced_table_name : 'list',
        referenced_column_name: 'id'
      },
      {
        table_name            : 'user',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      }
    ],
    referentialConstraints: [
      {
        constraint_name         : 'todo_creator_id_foreign',
        unique_constraint_schema: 'wetland_test',
        unique_constraint_name  : 'PRIMARY',
        update_rule             : 'RESTRICT',
        delete_rule             : 'RESTRICT',
        table_name              : 'todo',
        referenced_table_name   : 'user'
      },
      {
        constraint_name         : 'todo_list_id_foreign',
        unique_constraint_schema: 'wetland_test',
        unique_constraint_name  : 'PRIMARY',
        update_rule             : 'RESTRICT',
        delete_rule             : 'RESTRICT',
        table_name              : 'todo',
        referenced_table_name   : 'list'
      }
    ]
  },
  postal: {
    columns               : [
      {
        column_default: null,
        table_name    : 'address',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'address',
        column_name   : 'street',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(255)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'address',
        column_name   : 'house_number',
        data_type     : 'int',
        extra         : '',
        column_key    : '',
        column_type   : 'int(11)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'address',
        column_name   : 'postcode',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(255)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'address',
        column_name   : 'country',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(255)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'delivery',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: 'CURRENT_TIMESTAMP',
        table_name    : 'delivery',
        column_name   : 'created',
        data_type     : 'timestamp',
        extra         : '',
        column_key    : '',
        column_type   : 'timestamp',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'delivery',
        column_name   : 'address_id',
        data_type     : 'int',
        extra         : '',
        column_key    : 'MUL',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'delivery',
        column_name   : 'order_id',
        data_type     : 'int',
        extra         : '',
        column_key    : 'MUL',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'order',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'order',
        column_name   : 'name',
        data_type     : 'varchar',
        extra         : '',
        column_key    : '',
        column_type   : 'varchar(255)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'tracker',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'tracker',
        column_name   : 'status',
        data_type     : 'int',
        extra         : '',
        column_key    : '',
        column_type   : 'int(11)',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'tracker_user',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      },
      {
        column_default: null,
        table_name    : 'tracker_user',
        column_name   : 'tracker_id',
        data_type     : 'int',
        extra         : '',
        column_key    : 'MUL',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'tracker_user',
        column_name   : 'user_id',
        data_type     : 'int',
        extra         : '',
        column_key    : 'MUL',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'YES'
      },
      {
        column_default: null,
        table_name    : 'user',
        column_name   : 'id',
        data_type     : 'int',
        extra         : 'auto_increment',
        column_key    : 'PRI',
        column_type   : 'int(10) unsigned',
        is_nullable   : 'NO'
      }
    ],
    constraints           : [
      {
        table_name            : 'address',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'delivery',
        column_name           : 'address_id',
        constraint_name       : 'delivery_address_id_foreign',
        referenced_table_name : 'address',
        referenced_column_name: 'id'
      },
      {
        table_name            : 'delivery',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'delivery',
        column_name           : 'order_id',
        constraint_name       : 'delivery_order_id_foreign',
        referenced_table_name : 'order',
        referenced_column_name: 'id'
      },
      {
        table_name            : 'order',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'tracker',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'tracker_user',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      },
      {
        table_name            : 'tracker_user',
        column_name           : 'tracker_id',
        constraint_name       : 'tracker_user_tracker_id_foreign',
        referenced_table_name : 'tracker',
        referenced_column_name: 'id'
      },
      {
        table_name            : 'tracker_user',
        column_name           : 'user_id',
        constraint_name       : 'tracker_user_user_id_foreign',
        referenced_table_name : 'user',
        referenced_column_name: 'id'
      },
      {
        table_name            : 'user',
        column_name           : 'id',
        constraint_name       : 'PRIMARY',
        referenced_table_name : null,
        referenced_column_name: null
      }
    ],
    referentialConstraints: [
      {
        constraint_name         : 'delivery_address_id_foreign',
        unique_constraint_schema: 'wetland_test',
        unique_constraint_name  : 'PRIMARY',
        update_rule             : 'RESTRICT',
        delete_rule             : 'RESTRICT',
        table_name              : 'delivery',
        referenced_table_name   : 'address'
      },
      {
        constraint_name         : 'delivery_order_id_foreign',
        unique_constraint_schema: 'wetland_test',
        unique_constraint_name  : 'PRIMARY',
        update_rule             : 'RESTRICT',
        delete_rule             : 'CASCADE',
        table_name              : 'delivery',
        referenced_table_name   : 'order'
      },
      {
        constraint_name         : 'tracker_user_user_id_foreign',
        unique_constraint_schema: 'wetland_test',
        unique_constraint_name  : 'PRIMARY',
        update_rule             : 'RESTRICT',
        delete_rule             : 'RESTRICT',
        table_name              : 'tracker_user',
        referenced_table_name   : 'user'
      },
      {
        constraint_name         : 'tracker_user_tracker_id_foreign',
        unique_constraint_schema: 'wetland_test',
        unique_constraint_name  : 'PRIMARY',
        update_rule             : 'RESTRICT',
        delete_rule             : 'RESTRICT',
        table_name              : 'tracker_user',
        referenced_table_name   : 'tracker'
      }
    ]
  }
};
