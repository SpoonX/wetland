module.exports = {
  entityPath: __dirname + '/entity',
  stores    : {
    defaultStore: {
      client          : 'sqlite3',
      useNullAsDefault: true,
      connection      : {filename: `./todo.sqlite`}
    }
  }
};
