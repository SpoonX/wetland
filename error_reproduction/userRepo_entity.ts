const { EntityRepository } = require('wetland');
class UserRepository extends EntityRepository {
}

export class EN_XC_USER {
	static setMapping(mapping) {

		mapping.entity({store: 'defaultcon', repository: EntityRepository, tableName: 'XC_USER'});

		mapping.forProperty('ID').primary();

		mapping.field('XC_MANDANTEN_ID', {
			type: 'string',
			name: 'XC_MANDANTEN_ID',
			nullable: false,
		});
		mapping.field('LANDINGPAGE', {
			type: 'string',
			name: 'LANDINGPAGE',
			nullable: false,
		});
		mapping.field('NAME', {
			type: 'string',
			name: 'NAME',
			nullable: false,
		});
		mapping.field('DESCRIPTION', {
			type: 'text',
			name: 'DESCRIPTION',
			nullable: false,
		});
		mapping.field('EMAIL', {
			type: 'string',
			name: 'EMAIL',
			nullable: false,
		});
		mapping.field('PASSWORD', {
			type: 'string',
			name: 'PASSWORD',
			nullable: false,
		});
		mapping.field('CREATED_AT', {
			type: 'datetime',
			name: 'CREATED_AT',
			nullable: false,
		});
		mapping.field('CREATED_BY', {
			type: 'string',
			name: 'CREATED_BY',
			nullable: false,
		});
		mapping.field('LAST_LOGIN', {
			type: 'datetime',
			name: 'LAST_LOGIN',
			nullable: false,
		});
		mapping.field('LANGUAGE', {
			type: 'string',
			name: 'LANGUAGE',
			nullable: false,
		});
		mapping.field('ACTIVE', {
			type: 'integer',
			name: 'ACTIVE',
			size: 1,
			nullable: false,
		});
		mapping.field('ADMINISTRATOR', {
			type: 'integer',
			name: 'ADMINISTRATOR',
			size: 1,
			nullable: false,
		});
		mapping.field('GROUP_ADMIN', {
			type: 'integer',
			name: 'GROUP_ADMIN',
			size: 1,
			nullable: false,
		});
		
		mapping.manyToMany('XC_USER_XC_USERGROUP', {targetEntity: 'EN_XC_USER_GROUP', mappedBy: 'XC_USERGROUP_XC_USER'});
		mapping.joinTable('XC_USER_XC_USERGROUP', {
			name: 'XC_USER_GROUPS',
			joinColumns: [{name: 'XC_USER_ID', referencedColumnName: 'ID', type: 'string'}],
			inverseJoinColumns: [{name: 'XC_USER_GROUP_ID', referencedColumnName: 'ID', type: 'string'}]
		});

		mapping.manyToOne('XC_USER_XC_MANDANTEN', {targetEntity: 'EN_XC_MANDANTEN', inversedBy: 'XC_MANDANTEN_XC_USER'});
		mapping.joinColumn('XC_USER_XC_MANDANTEN', {name: 'XC_MANDANTEN_ID', referencedColumnName: 'ID', type: 'string'});

		mapping.oneToMany('XC_USER_XC_PROJECT_USER', {targetEntity: 'EN_XC_PROJECT_USER', mappedBy: 'XC_PROJECT_USER_XC_USER'});
		mapping.joinColumn('XC_USER_XC_PROJECT_USER', {name: 'ID', referencedColumnName: 'XC_USER_ID', type: 'string'});

		mapping.oneToMany('XC_USER_XC_PDF_SHOP_USER', {targetEntity: 'EN_XC_PDF_SHOP_USER', mappedBy: 'XC_PDF_SHOP_USER_XC_USER'});
		mapping.joinColumn('XC_USER_XC_PDF_SHOP_USER', {name: 'ID', referencedColumnName: 'XC_USER_ID', type: 'string'});

		mapping.oneToMany('XC_USER_XC_USER_CONFIG_DATA', {targetEntity: 'EN_XC_USER_CONFIG_DATA', mappedBy: 'XC_USER_CONFIG_DATA_XC_USER'});
		mapping.joinColumn('XC_USER_XC_USER_CONFIG_DATA', {name: 'ID', referencedColumnName: 'XC_USER_ID', type: 'string'});

		mapping.oneToMany('XC_USER_XC_USER_SESSION_LOCKS', {targetEntity: 'EN_XC_USER_SESSION_LOCKS', mappedBy: 'XC_USER_SESSION_LOCKS_XC_USER'});
		mapping.joinColumn('XC_USER_XC_USER_SESSION_LOCKS', {name: 'ID', referencedColumnName: 'XC_USER_ID', type: 'string'});
	}
}
