import { EN_XC_USER } from "./userRepo_entity";
const Wetland = require('wetland').Wetland;

let wetlandConf = {	
	stores: {
		defaultcon: {
			name: 'defaultcon',
			client: 'mssql',
			connection: {
				host: '',
				database: '',
				user: '',
				password: ''
			},
		}
	},
	entities: [EN_XC_USER],
	defaultStore: 'defaultcon',
	migrator: {
		directory: './migrations',
	}
};

let wetland = new Wetland(wetlandConf);

let repo = wetland.getManager().getRepository('EN_XC_USER');

repo.findOne({ID: 'USERAB8F4464D3D74064A83C57B8D969D016'}).then(function(result) {
	let user = result;
}).catch(function(err) {

});