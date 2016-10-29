import {Mapping, Field} from '../../src/Mapping';
import {ToUnderscore} from '../resource/entity/ToUnderscore';
import {Product} from '../resource/entity/shop/product';
import {Category} from '../resource/entity/shop/category';
import {User} from '../resource/entity/shop/user';
import {EntityRepository} from '../../src/EntityRepository';
import {Wetland} from '../../src/Wetland';
import {assert} from 'chai';

class FooEntity {
  static setMapping(mapping) {
    mapping.field('camelCase', {type: 'integer'});
    mapping.field('PascalCase', {type: 'integer'});
  }
}

let wetland = new Wetland({
  mapping : {
    defaultNamesToUnderscore: true
  },
  entities: [ToUnderscore, Product, User]
});

function getMapping(entity) {
  return wetland.getEntityManager().getMapping(entity);
}

describe('Mapping', () => {
  describe('forEntity()', () => {
    it('should get the mapping for a specific entity', () => {
      assert.instanceOf(Mapping.forEntity(ToUnderscore), Mapping);
    });

    it('should return an new mapping instance if no mapping was found', () => {
      let map = Mapping.forEntity(new FooEntity());

      assert.instanceOf(Mapping.forEntity(new FooEntity()), Mapping);
    });
  });

  describe('.getTarget()', () => {
    it('should return the entity this mapping is for', () => {
      let mapping = getMapping(ToUnderscore);

      assert.deepEqual(mapping.getTarget(), ToUnderscore);
    });
  });

  describe('.field()', () => {
    it('should replace case to underscore by default and add the options', () => {
      let mapping = getMapping(ToUnderscore);
      let camel = {
        name: 'camel_case_to_underscore',
        type: 'string',
        size: 20
      };
      let pascal = {
        name: 'pascal_to_underscore',
        type: 'integer'
      };

      assert.deepEqual(mapping.getField('camelCaseToUnderscore'), camel);
      assert.deepEqual(mapping.getField('PascalToUnderscore'), pascal);
    });

    it('should not duplicate underscores on properties containing both underscore and case', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getField('camelCaseAnd_underscore').name, 'camel_case_and_underscore');
    });

    it('should not underscore custom property names', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getField('customName').name, 'customColumnName');
    });

    it('should not change underscored lower case property names', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getField('already_underscore').name, 'already_underscore');
    });

    it('should set column name to the property name', () => {
      let mapping     = getMapping(ToUnderscore);
      let columnNames = {
        camel_case_to_underscore : 'camelCaseToUnderscore',
        pascal_to_underscore     : 'PascalToUnderscore',
        already_underscore       : 'already_underscore',
        customColumnName         : 'customName',
        camel_case_and_underscore: 'camelCaseAnd_underscore',
        underscore_id            : 'id'
      };

      assert.deepEqual(mapping.mapping.fetch('columns'), columnNames);
    });

    it('should keep casing if `defaultNamesToUnderscore` is set to false', () => {
      let wetland = new Wetland({entities: [FooEntity]});
      let mapping = wetland.getEntityManager().getMapping(FooEntity);
      let columnName = {
        camelCase : 'camelCase',
        PascalCase: 'PascalCase'
      };

      assert.deepEqual(mapping.mapping.fetch('columns'), columnName);
    });
  });

  describe('.getRepository()', () => {
    it('should get the repository class for this mapping entity', () => {
      let mapping = getMapping(ToUnderscore);

      assert.deepEqual(mapping.getRepository(), EntityRepository);
    });
  });

  describe('.getColumnName()', () => {
    it('should get the column name for a property', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getColumnName('camelCaseToUnderscore'), 'camel_case_to_underscore');
    });
  });

  describe('.getPropertyName()', () => {
    it('should get the property name for a column name', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getPropertyName('camel_case_to_underscore'), 'camelCaseToUnderscore');
    });
  });

  describe('.entity()', () => {
    it('should map custom options for an entity', () => {
      let mapping = getMapping(Product);
      let options = {
        name     : 'entity_custom_name',
        tableName: 'custom_table_name',
        store    : 'defaultStore'
      };

      mapping.entity(options);

      assert.strictEqual(mapping.mapping.fetch('entity.name'), options.name);
      assert.strictEqual(mapping.mapping.fetch('entity.tableName'), options.tableName);
      assert.strictEqual(mapping.mapping.fetch('entity.store'), options.store);
    });

    it('should map entity with default options', () => {
      let wetland = new Wetland({entities: [FooEntity]});
      let mapping = wetland.getEntityManager().getMapping(FooEntity);

      mapping.entity({});

      assert.strictEqual(mapping.mapping.fetch('entity.name'), 'FooEntity');
      assert.strictEqual(mapping.mapping.fetch('entity.repository'), EntityRepository);
      assert.strictEqual(mapping.mapping.fetch('entity.tableName'), 'fooentity');
      assert.isNull(mapping.mapping.fetch('entity.store'));
    });

    it('should map an entity with default names set to underscore', () => {
      let mapping = getMapping(ToUnderscore);

      mapping.entity({});

      assert.strictEqual(mapping.mapping.fetch('entity.name'), 'ToUnderscore');
      assert.strictEqual(mapping.mapping.fetch('entity.tableName'), 'to_underscore');
    });
  });

  describe('.index()', () => {
    it('should map an single index with default index name', () => {
      let mapping    = getMapping(ToUnderscore);
      let columnName = mapping.getColumnName('camelCaseToUnderscore');
      let index      = {idx_camel_case_to_underscore: ['camel_case_to_underscore']};

      mapping.index(columnName);

      assert.deepEqual(mapping.mapping.fetch('indexes'), index);
    });

    it('should map indexes using a custom index name', () => {
      let mapping = getMapping(ToUnderscore);
      let indexes = ['customColumnName', 'already_underscore'];

      mapping.index('myIndex', indexes);

      assert.sameMembers(mapping.mapping.fetch('indexes.myIndex'), indexes);
    });
  });

  describe('.getIndexes()', () => {
    it('should get the indexes', () => {
      let mapping = getMapping(ToUnderscore);
      let indexes = {
        idx_camel_case_to_underscore: ['camel_case_to_underscore'],
        myIndex                     : ['customColumnName', 'already_underscore']
      };

      assert.deepEqual(mapping.getIndexes(), indexes);
    });
  });

  describe('.primary()', () => {
    it('should map a property to be the primary key', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.mapping.fetch('primary'), 'id');
    });
  });

  describe('.getPrimaryKeyField()', () => {
    it('should get the column name for the primary key', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getPrimaryKeyField(), 'underscore_id');
    });
  });

  describe('.getPrimaryKey()', () => {
    it('should get the property that has be assigned as the primary key', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getPrimaryKey(), 'id');
    });
  });

  describe('.getFieldName()', () => {
    it('should get the column name of the property', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getFieldName('customName'), 'customColumnName');
    });
  });

  describe('.getFields()', () => {
    it('should get the fields for mapped entity', () => {
      let mapping = getMapping(ToUnderscore);
      let fields  = {
        id                   : {
          primary       : true,
          generatedValue: 'autoIncrement',
          name          : 'underscore_id'
        },
        camelCaseToUnderscore: {
          name: 'camel_case_to_underscore',
          type: 'string',
          size: 20
        },
        PascalToUnderscore   : {
          name: 'pascal_to_underscore',
          type: 'integer'
        },
        already_underscore   : {
          name: 'already_underscore',
          type: 'boolean'
        },
        camelCaseAnd_underscore : {
          name: 'camel_case_and_underscore',
          type: 'boolean'
        },
        customName           : {
          name: 'customColumnName',
          type: 'string'
        }
      };

      assert.deepEqual(mapping.getFields(), fields);
    });
  });

  describe('.getEntityName()', () => {
    it('should get the name of the entity', () => {
      let mapping = getMapping(Product);

      assert.strictEqual(mapping.getEntityName(), 'entity_custom_name');
    });
  });

  describe('.getTableName()', () => {
    it('should get the name of the table', () => {
      let mapping = getMapping(Product);

      assert.strictEqual(mapping.getTableName(), 'custom_table_name');
    });
  });

  describe('.getStoreName()', () => {
    it('should get the store mapped to this entity', () => {
      let mapping = getMapping(Product);

      assert.strictEqual(mapping.getStoreName(), 'defaultStore');
    });
  });

  describe('.generatedValue()', () => {
    it('should map generated values', () => {
      let mapping = getMapping(ToUnderscore);

      assert.isNotNull(mapping.getField('id').generatedValue);
    });
  });

  describe('.increments()', () => {
    it('should set auto increment', () => {
      let mapping = getMapping(ToUnderscore);

      assert.strictEqual(mapping.getField('id').generatedValue, 'autoIncrement');
    });
  });

  describe('.uniqueConstraint()', () => {
    it('should map an unique constraint', () => {
      let mapping    = getMapping(ToUnderscore);
      let columnName = mapping.getColumnName('id');
      let constraint = {underscore_id_unique: ['underscore_id']};

      mapping.uniqueConstraint(columnName);

      assert.deepEqual(mapping.mapping.fetch('uniqueConstraints'), constraint);
    });

    it('should map an unique constraint with custom name', () => {
      let mapping = getMapping(ToUnderscore);

      mapping.uniqueConstraint('custom_unique', 'already_underscore');

      assert.sameMembers(mapping.mapping.fetch('uniqueConstraints.custom_unique'), ['already_underscore']);
    });
  });

  describe('.getUniqueConstraints()', () => {
    it('should get unique constraints', () => {
      let mapping = getMapping(ToUnderscore);
      let unique  = {
        underscore_id_unique: ['underscore_id'],
        custom_unique       : ['already_underscore']
      };

      assert.deepEqual(mapping.getUniqueConstraints(), unique);
    });
  });

  describe('.cascade()', () => {
    it('should set cascade values', () => {
      let mapping = getMapping(Product);

      assert.sameMembers(mapping.getField('categories').cascades, ['persist']);
    });
  });

  describe('.isRelation()', () => {
    it('should return true if property exist as relation', () => {
      let mapping = getMapping(Product);

      assert.isTrue(mapping.isRelation('author'));
    });

    it('should return false if property does not exist as a relation', () => {
      let mapping = getMapping(Product);

      assert.isFalse(mapping.isRelation('name'));
    });
  });

  describe('.getRelations()', () => {
    it('should get the relations for mapped entity', () => {
      let mapping   = getMapping(Product);
      let relations = {
        image     : {
          type        : 'oneToOne',
          targetEntity: 'Image'
        },
        categories: {
          type        : 'manyToMany',
          targetEntity: Category,
          inversedBy  : 'products'
        },
        author    : {
          type        : 'manyToOne',
          targetEntity: User,
          inversedBy  : 'products'
        }
      };

      assert.deepEqual(mapping.getRelations(), relations);
    });
  });

  describe('.oneToOne()', () => {
    it('should map a one-to-one relationship', () => {
      let mapping   = getMapping(Product);
      let relations = mapping.getRelations();

      assert.strictEqual(relations['image'].type, 'oneToOne');
    });
  });

  describe('.oneToMany()', () => {
    it('should map a one-to-many relationship', () => {
      let mapping   = getMapping(User);
      let relations = mapping.getRelations();

      assert.strictEqual(relations['products'].type, 'oneToMany');
    });
  });

  describe('.manyToOne()', () => {
    it('should map a many-to-one relationship', () => {
      let mapping   = getMapping(Product);
      let relations = mapping.getRelations();

      assert.strictEqual(relations['author'].type, 'manyToOne');
    });
  });

  describe('.manyToMany()', () => {
    it('should map a many-to-many relationship', () => {
      let mapping   = getMapping(Product);
      let relations = mapping.getRelations();

      assert.strictEqual(relations['categories'].type, 'manyToMany');
    });
  });

  describe('.joinTable(), .getJoinTables()', () => {
    it('should register a join table and fetch all join tables registered', () => {
      let mapping   = getMapping(Product);
      let joinTable = [{
        name              : 'product_custom_join_category',
        joinColumns       : [{referencedColumnName: 'id', name: 'product_id'}],
        inverseJoinColumns: [{referencedColumnName: 'id', name: 'category_id'}]
      }];

      assert.sameDeepMembers(mapping.getJoinTables(), joinTable);
    });
  });

  describe('.joinColumn(), .getJoinColumn()', () => {
    it('should register a join column and fetch said column via property', () => {
      let mapping    = getMapping(Product);
      let joinColumn = {
        name                : 'author_id',
        referencedColumnName: 'id',
        unique              : false,
        nullable            : true
      };

      assert.deepEqual(mapping.getJoinColumn('author'), joinColumn);
    });
  });

  describe('.getJoinTable()', () => {
    it('should get the join table for the relationship mapped via property', () => {
      let mapping   = getMapping(Product);
      let joinTable = {
        name              : 'product_custom_join_category',
        joinColumns       : [{referencedColumnName: 'id', name: 'product_id', type: 'integer'}],
        inverseJoinColumns: [{referencedColumnName: 'id', name: 'category_id', type: 'integer'}]
      };

      assert.deepEqual(mapping.getJoinTable('categories'), joinTable);
    });
  });
});
