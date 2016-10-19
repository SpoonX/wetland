export class Migration {
  public static up(migration) {
    let builder       = migration.getBuilder();
    let schemaBuilder = builder.schema;
    let knex          = builder.knex;

    schemaBuilder.createTable('person', tableBuilder => {
      tableBuilder.increments();
      tableBuilder.string('name');
      tableBuilder.timestamp('creationTime').defaultTo(knex.fn.now());
    });

    schemaBuilder.createTable('animal', tableBuilder => {
      tableBuilder.increments();
      tableBuilder.string('name');
    });

    let schemaBuilder2 = migration.getSchemaBuilder();

    schemaBuilder2.createTable('robot', tableBuilder => {
      tableBuilder.increments();
      tableBuilder.string('name');
      tableBuilder.string('deadly_skill');
    });
  }

  public static down(migration) {
    let schemaBuilder = migration.getSchemaBuilder();

    schemaBuilder.dropTable('person');
    schemaBuilder.dropTable('animal');

    let schemaBuilder2 = migration.getSchemaBuilder();

    schemaBuilder2.dropTable('robot');
  }
}
