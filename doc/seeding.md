# Seeding

Seeding consist in populating the database from fixtures.

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
