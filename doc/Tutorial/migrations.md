# Migrations
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 4-migrations --single-branch`
> 
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 3-dev-migrations --single-branch`
> 
> **Github:** [Diff for this part of the tutorial](https://github.com/SpoonX/wetland-tutorial/compare/3-dev-migrations...4-migrations?diff=split) - [Full repository on github](https://github.com/SpoonX/wetland-tutorial)

In this part of the tutorial we'll be looking at migrations.

## Creating our migration
Alright, now we're done with our feature, let's create an actual migration! Instead of going into detail, I'll just let you run the command so that the result can speak for itself and blow you away:

```
$ wetland migrator create stock-support

  Success: Migration file '20170228114455_stock_support.js' created successfully!
```

Now when you open up the generated file `migrations/20170228114455_stock_support.js` you should see this:

```js
class Migration {
  static up(migration) {
    let builder = migration.getBuilder('defaultStore');

    builder.schema.alterTable('product', table => {
      table.integer('stock').notNullable().defaultTo('0');
    });
  }

  static down(migration) {
    let builder = migration.getBuilder('defaultStore');

    builder.schema.alterTable('product', table => {
      table.dropColumn('stock');
    });
  }
}

module.exports.Migration = Migration;
```

_**Note:** Can't find the file? Maybe it has a different name. The first part is variable and time based._

### Wow, wait, what?
Yeah. I know...

We can now write code without touching our database schema, _and_ we get actual migrations. Woooaaah.

### Yeah but, seriously.. What?
Yeah, sorry. So, this command just diffed the snapshot we made in the previous step of this tutorial against our current mapping, exactly like the dev migration did. The difference here, is that dev migrations always diff against the previous version, whereas with snapshots you can combine a larger more complex diff to create a migration.

#### The getBuilder method
_Stores_ are a concept we'll tackle in a later part, but they're basically just what you use to configure your database credentials for. The default store in our case is the sqlite database.

The getBuilder method returns an object containing a schema builder, and the knex instance (connection) for that store. When manually writing migrations, you only use this method when you have multiple stores.

Instead, you could use the getSchemaBuilder method, which takes away the object. Example:

```js
class Migration {
  static up(migration) {
    migration.getSchemaBuilder().alterTable('product', table => {
      table.integer('stock').notNullable().defaultTo('0');
    });
  }

  static down(migration) {
    migration.getSchemaBuilder().alterTable('product', table => {
      table.dropColumn('stock');
    });
  }
}

module.exports.Migration = Migration;
```

This is only relevant if you manually write your migrations. But nonetheless useful to know.

#### Schema builder
Migrations use knexjs's schema builder. If you want to know what methods are exposed, and what operations you can perform it's best to look in [knexjs's documentation](http://knexjs.org/#Schema-Building).

### Status
Now that we created our first migration, let's use another new command, `status`, to see what wetland sees. Open up the terminal and give it a go:

```
$ wetland migrator status

┌──────────────────────────────┬────────┬────────┬───────────────┐
│ Migration                    │ Run at │ Run ID │ Status        │
├──────────────────────────────┼────────┼────────┼───────────────┤
│ 20170228114455_stock_support │ N/A    │ N/A    │ ✖ Not applied │
└──────────────────────────────┴────────┴────────┴───────────────┘
```

Here we can see that the migration exists, and hasn't been applied yet.

#### Peeking ahead
The migration tool has commands for running up, down, to latest, revert, undo and more. _(Run `wetland migrator --help` to get more info)_.

Let's take a look at what would happen if we were to migrate to the latest version (in this case, our only migration).

Run `wetland migrator latest -d` and you should see this:

```sql
-- Queries for next migration
alter table "product" add column "stock" integer not null default '0'
```

#### Running our migration
We know our database is already up to date, because we have run the dev migrations. So, let's revert our database schema back to when we started working on our feature so we can test our newly created migration.

Run: `wetland migrator revert stock_support -r`

Great, now let's run our migrations to go back to the new version:

```
$ wetland migrator latest -r

  Success: '1' migrations executed!
```

Now, let's check out our status again:

```
$ wetland migrator status

┌──────────────────────────────┬─────────────────────┬────────┬───────────┐
│ Migration                    │ Run at              │ Run ID │ Status    │
├──────────────────────────────┼─────────────────────┼────────┼───────────┤
│ 20170228114455_stock_support │ 2017-02-28 11:19:49 │ 1      │ ✓ Applied │
└──────────────────────────────┴─────────────────────┴────────┴───────────┘
```

Play around a little:

```
$ wetland migrator down -r

  Success: '1' migrations executed!!

$ wetland migrator status

┌──────────────────────────────┬────────┬────────┬───────────────┐
│ Migration                    │ Run at │ Run ID │ Status        │
├──────────────────────────────┼────────┼────────┼───────────────┤
│ 20170228114455_stock_support │ N/A    │ N/A    │ ✖ Not applied │
└──────────────────────────────┴────────┴────────┴───────────────┘

$ wetland migrator up -r

  Success: '1' migrations executed!!

$ wetland migrator status

┌──────────────────────────────┬─────────────────────┬────────┬───────────┐
│ Migration                    │ Run at              │ Run ID │ Status    │
├──────────────────────────────┼─────────────────────┼────────┼───────────┤
│ 20170228114455_stock_support │ 2017-02-28 11:24:23 │ 1      │ ✓ Applied │
└──────────────────────────────┴─────────────────────┴────────┴───────────┘
```

## Next step
Great, we've created a migration file and executed it. We also played around with it a little and now have a better understanding as to how it all works.

[Go to the next part](relations.md).
