export interface MigrationsResults {
  baz: string,
  foo: string,
  bar: string
}

let migrations: {up?: MigrationsResults, down?: MigrationsResults, latest?: string, revert?: string} = {};

migrations.up = {
  baz: 'create table `ticket` (`id` int unsigned not null auto_increment primary key, `name` varchar(255))',
  foo: [
    'create table `person` (`id` int unsigned not null auto_increment primary key, `name` varchar(255), `creationTime` timestamp default CURRENT_TIMESTAMP);',
    'create table `animal` (`id` int unsigned not null auto_increment primary key, `name` varchar(255))',
    'create table `robot` (`id` int unsigned not null auto_increment primary key, `name` varchar(255), `deadly_skill` varchar(255))'
  ].join('\n'),
  bar: 'create table `user` (`id` int unsigned not null auto_increment primary key, `name` varchar(255))'
};

migrations.down = {
  bar: 'drop table `user`',
  baz: 'drop table `ticket`',
  foo: [
    'drop table `person`;',
    'drop table `animal`',
    'drop table `robot`'
  ].join('\n')
};

migrations.latest = [
  migrations.up.baz,
  migrations.up.foo,
  migrations.up.bar,
].join('\n');

migrations.revert = [
  migrations.down.bar,
  migrations.down.foo,
  migrations.down.baz,
].join('\n');

export {migrations};
