"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const Mapping_1 = require("../../../src/decorators/Mapping");
let Field = class Field {
};
__decorate([
    Mapping_1.field({ type: 'number' }),
    Mapping_1.generatedValue('autoIncrement'), 
    __metadata('design:type', Number)
], Field.prototype, "id", void 0);
__decorate([
    Mapping_1.field({ type: 'string', name: 'login', size: 50 }), 
    __metadata('design:type', String)
], Field.prototype, "username", void 0);
__decorate([
    Mapping_1.field({ type: 'string', length: 164 }), 
    __metadata('design:type', Boolean)
], Field.prototype, "password", void 0);
__decorate([
    Mapping_1.field({ type: 'string', comment: 'Hello world' }), 
    __metadata('design:type', String)
], Field.prototype, "email", void 0);
Field = __decorate([
    Mapping_1.entity(),
    Mapping_1.index('username'),
    Mapping_1.uniqueConstraint(['email', 'username']), 
    __metadata('design:paramtypes', [])
], Field);
exports.Field = Field;
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
                    connections: {
                        master: {
                            role: 'master',
                            hostname: 'localhost',
                            username: 'root',
                            password: '',
                            database: 'foo',
                            port: 3306
                        },
                        slave: {
                            role: 'slave',
                            hostname: 'remotehost',
                            username: 'square',
                            password: '',
                            database: 'bar',
                        },
                        slaveTwo: {
                            role: 'slave',
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
            .entity({ name: 'default_store' })
            .field('foo', { type: 'string' });
    }
}
class WithCustomStore {
    static mapping(mapping) {
        // Get mapping for store other than default store.
        mapping.store('extended')
            .entity({ name: 'custom_store' })
            .field('foo', { type: 'string' });
    }
}
class WithCustomStoreTypescript {
}
__decorate([
    Mapping_1.field({ type: 'string' }), 
    __metadata('design:type', String)
], WithCustomStoreTypescript.prototype, "foo", void 0);
