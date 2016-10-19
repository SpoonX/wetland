export class Migration {
  public static up(migration) {
    let schemaBuilder = migration.getSchemaBuilder();

    schemaBuilder.createTable('user', tableBuilder => {
      tableBuilder.increments();
      tableBuilder.string('name');
    });
  }

  public static down(migration) {
    let schemaBuilder = migration.getSchemaBuilder();

    schemaBuilder.dropTable('user');
  }
}
