# Seeding

Seeding consist in populating the database from fixtures.

## Fixtures

A `fixture` is file which represents entities belonging to a repository.
In wetland fixtures can be written in `JSON` and `csv` (If you think we need to support more don't hesitate to create a PR).

### Types of file

#### JSON

For `json` entities are represented by object in an array. Each object in the array is an entity.

##### Example

Post.json
```json
[
  {
    "title": "Main post",
    "content": "Content...."
  },
  {
    "title": "Test",
    "content": "Content...."
  }
]
```

#### CSV

For `csv` entities are represented by a line (column support is not here but an issue is opened !) expect for the first line which represents the field name.

##### Example

Pet.csv
```csv
id,name
9,Kyle
2,Jill
10,Jullia
```

## Types of seeding

Wetland supports $$2^2 = 4$$ modes of seeding.

## Safe or clean

### Safe

Safe seeding refers to the concept of verifying if a record already exist before seeding it, there's little risk associated with it that's why we call it safe seeding...

### Clean
Clean seeding refers to the concept of clearing the database before seeding.

## Lifecycle or no lifecycle

### Lifecycle

The lifecycle mode means that features will go through the lifecycles before being inserted : that's the default mode.

## No lifecyle

The no lifecycle mode means that feature will not go through the lifecyles before being inserted.


## Setup

### Fixtures directory and file type support

```
└── fixtures 
    ├── User.json
    ├── Pet.csv
    └── Entity.extension
```

Everything must be in a single folder, subfolder are not supported for the moment.
The name of the file **must** be the name of the entity, the extension **must** either be `csv` or `json`.

### Config

The seeder has to be configured.

```js
const config = {
  seed         : {
    fixturesDirectory   : 'fixtures', // Each filename is an entity
    bypassLifecyclehooks: true,
    clean               : false
  },
  entities     : []
}
```

## The code

If you want to use the seeder you must ask wetland to give you one.

```js
const seeder = wetland.getSeeder();
```

### Clean seeding

If you do clean seeding you should use the seeder like this :

```js
const migrator = wetland.getMigrator();
const seeder = wetland.getSeeder();
const cleaner = wetland.getCleaner();

cleaner.clean() // Will clean the database, NO MAGICAL GOING BACK
          .then(() => migrator.devMigrations(false)) // Will actually do the migrations : needed here because the clean method wipes the database entirely
          .then(() => seeder.seed()) // Will seed accordingly to the configuration you gave wetland
```

## Safe seeding

If you want to do safe seeding you should use the seeder like this :

```js
const migrator = wetland.getMigrator();
const seeder = wetland.getSeeder();

migrator.devMigrations(false) // Will migrate the database
          .then(() => seeder.seed()) // Will seed accordingly to the configuration you gave wetland
```

All of the above assume you are using the seeder in the dev environment : most likely the most common use case would be tests and dev setup (seeding your database some data for development). But you could chose to use it for production but then most likely you want to stay safe and not use dev migrations effectively just doing this :

```js
const seeder = wetland.getSeeder();

seeder.seed()
```
