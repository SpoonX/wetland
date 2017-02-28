# Dev migrations
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 3-dev-migrations --single-branch`
> 
> To clone the base code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 2-entities --single-branch`
> 
> Find the full repository on github [here](https://github.com/SpoonX/wetland-tutorial).

In this part of the tutorial we'll be looking at snapshots, dev-migrations and migrations.

## Preparing
We'll be working with migrations, and dev migrations. Migrations allow you to update the schema of your database, and revert to an older state, without having to do so manually. This takes away any "human error" you might produce during the migrations themselves.

### Snapshot
As we briefly touched in the previous part of this tutorial, wetland makes use of snapshots for migrations.

Snapshots are basically a "save" of your mapping that can be used to diff against other snapshots, or your current mapping. You can read more about them, and the motivation behind building this system [in the docs](../snapshots.html).

In this part, we'll be adding stock support to our product entity. To allow wetland to calculate the difference between our current mapping, and the mapping we'll have when we're done, let's start off by creating a snapshot.

```
$ wetland snapshot create stock-support

  Success: Snapshot 'stock_support' created successfully!
```

_**Note:** if you don't supply a name for your snapshot (last parameter) the name of your git branche gets used by default._

_**Another note:** We'll cover migrations in the next step of this tutorial. The snapshot is for preparation._

### Adding stock
Open up `app/entity/Product.js` and add the following field to your mapping:

```js
class Product {
  static setMapping(mapping) {
    mapping.forProperty('id').primary().increments();

    mapping.field('name', {type: 'string'});

    // This is the new field!
    mapping.field('stock', {type: 'integer', defaultTo: 0});
  }
}

module.exports = Product;
```

Sweet, we now have a stock that defaults to `0` (no stock). Let's update our schema!

### Running dev migration
Because we created our schema using dev migrations in the previous part of this tutorial, wetland now has something called a "dev snapshot". This is identical to a regular snapshot. The only difference is that it gets stored separately, and is managed by wetland internally.

Running a dev migration, is going to diff our current schema (with the added stock) to the previous run (when we created our schema). Let's start off by checking what wetland _would_ do before actually applying anything.

Run the following command in your terminal: `wetland migrator dev -d`

The result should look like this:

```sql
-- Queries for dev migrations:
alter table "product" add column "stock" integer not null default '0'
```

That makes sense, that's what we added. Now let's apply the dev migration to our database schema:

```
wetland migrator dev -r

  Success: Dev migrations applied!
```

Just to show you that dev migrations store a new snapshot, I'd like you to run the dump command again:

`wetland migrator dev -d`

This time, the output should look like this:

```sql
-- Queries for dev migrations:
-- Nothing to do.
```

## Automated dev migrations
Cool, so our dev migration was a success!

Obviously it would be a bit annoying to have to run this command with every change we make, so let's automate that.

Open up `app.js`, and change the app.listen to be the following:

```js
// Update the database schema
wetland.getMigrator().devMigrations().then(() => {
  // Start server
  app.listen(3000, () => console.log('Inventory manager ready! Available on http://127.0.0.1:3000'));
});
```

Now, every time we start our server, dev migrations will run and apply.

## Next step
Great, we've created a snapshot, added stock to our product, updated our schema and made sure that dev migrations will run every time we start our server.

[Go to the next part](migrations.md).
