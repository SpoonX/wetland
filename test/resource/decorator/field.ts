import {entity, field, generatedValue, index, uniqueConstraint} from "../../../src/decorators/Mapping";
import {Wetland} from "../../../src/index";


@entity()
@index('username')
@uniqueConstraint(['email', 'username'])
export class Field {
  // @id()
  @field({type: 'number'})
  @generatedValue('autoIncrement')
  public id: number;

  @field({type: 'string', name: 'login', size: 50})
  public username: string;

  @field({type: 'string', length: 164})
  public password: boolean;

  @field({type: 'string', comment: 'Hello world'})
  public email: string;

  // @oneToMany({
  //   targetEntity     : Group,
  //   inversedBy       : 'posts',
  //   cascade          : ['persist', 'remove'],
  //   associationFields: []
  // })
  public groups;
}


/**
 * Wetland defines default behavior for all adapters.
 * Any custom behavior (types, cursor etc) are defined in the adapters themselves.
 *
 * @todo  Challenge: Entity managers have scopes. They also have their own unit of work.
 *        This should start a transaction in all adapters. Once they all succeed, all get to commit.
 *        Otherwise, all get to rollback.
 *        NOTE: This will only work for sql based adapters. Upside, this works even when mixed.
 *        NOTE: Users must require Mapping and decorators from the adapter the store utilizes.
 *              (Luckily, this is usually exactly the same code for most adapters (SQL based).
 */


let config = {

  // or .registerAdapters({mysql: require('wetland-mysql'), mongo: require('wetland-mongo')})
  // adapters: {
  //   mysql: require('wetland-mysql'), // Extends wetland-sql
  //   mongo: require('wetland-mongo')
  // },

  defaultStore: 'simple',

  // Or .registerStores();
  stores: {
    // Simple example, single database server.
    simple: {
      adapter: 'mysql',
      options: {
        username: 'root',
        password: '',
        database: 'foo'
      }
    },

    // Extended example, cluster with master / slave.
    extended: {
      adapter: 'mysql',
      options: {
        cluster: {
          defaultSelector: 'RR',
          connections    : {
            master: {
              role    : 'master',
              hostname: 'localhost',
              username: 'root',
              password: '',
              database: 'foo',
              port    : 3306
            },

            slave: {
              role    : 'slave',
              hostname: 'remotehost',
              username: 'square',
              password: '',
              database: 'bar',
            },

            slaveTwo: {
              role    : 'slave',
              hostname: 'nearhost',
              username: 'snoet',
              password: '',
              database: 'baz',
            },
          }
        }
      }
    }
  }
};

class WithDefaultStore {
  /**
   *
   * @param mapping
   */
  static mapping(mapping) {
    mapping
      .entity({name: 'default_store'})
      .field('foo', {type: 'string'});
  }
}

class WithCustomStore {
  static mapping(mapping) {
    // Get mapping for store other than default store.
    mapping.store('extended')
      .entity({name: 'custom_store'})
      .field('foo', {type: 'string'});
  }
}


class WithCustomStoreTypescript {
  @field({type: 'string'})
  foo: string;
}
