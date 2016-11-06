## Known limitations
Wetland migrations are pretty powerful, but have some minor limitations.

### Dev migrations
Dev migrations can't always do what should be done.
This includes renaming columns and changing column definitions.

- When you change the definition of a column, it gets dropped and created again.
- When you change the name of a column, it gets dropped and created again.
- When you change the name of a table, any relationships, unique constraints and indexes it has get dropped and recreated.
