<a name="4.1.2"></a>
## [4.1.2](https://github.com/SpoonX/wetland/compare/v4.1.1...v4.1.2) (2018-09-25)


### Features

* **Mapping:** add auto field decorators ([515ac29](https://github.com/SpoonX/wetland/commit/515ac29))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/SpoonX/wetland/compare/v4.1.0...v4.1.1) (2018-09-25)


### Features

* **Wetland:** add support for running in ts-node ([1cf8a30](https://github.com/SpoonX/wetland/commit/1cf8a30))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/SpoonX/wetland/compare/v4.0.2...v4.1.0) (2018-09-23)


### Features

* **EntityRepository:** add simple paging support ([b588434](https://github.com/SpoonX/wetland/commit/b588434))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/SpoonX/wetland/compare/v4.0.1...v4.0.2) (2018-09-23)



<a name="4.0.1"></a>
## [4.0.1](https://github.com/SpoonX/wetland/compare/v4.0.0...v4.0.1) (2018-09-23)



<a name="4.0.0"></a>
# [4.0.0](https://github.com/SpoonX/wetland/compare/v3.1.2...v4.0.0) (2018-09-23)


### Features

* **EntityManager:** add performance repositories ([569a3d1](https://github.com/SpoonX/wetland/commit/569a3d1))


### BREAKING CHANGES

* **EntityManager:** The EntityRepository has a method called getEntityManager, which now conditionally returns the EntityManager or an instance of Scope.
If you must have a Scope, call EntityRepository.getScope() instead.



<a name="3.1.2"></a>
## [3.1.2](https://github.com/SpoonX/wetland/compare/v3.1.1...v3.1.2) (2018-09-18)



<a name="3.1.1"></a>
## [3.1.1](https://github.com/SpoonX/wetland/compare/v3.1.0...v3.1.1) (2018-09-15)


### Bug Fixes

* **Mapping:** add missing Mapping return ([60ff891](https://github.com/SpoonX/wetland/commit/60ff891))
* **UnitOfWork:** throw error on missing pk value and add config to commit ([cbf5f6e](https://github.com/SpoonX/wetland/commit/cbf5f6e))


### BREAKING CHANGES

* **UnitOfWork:** This change will start throwing different errors. If you matched on the error message before you'll have to change that. Check the diff for details. Also, entities used to have null properties if no AI PK was found. This has been fixed. If you checked for them, please upodate your code.



<a name="3.1.0"></a>
# [3.1.0](https://github.com/SpoonX/wetland/compare/v3.0.0...v3.1.0) (2018-04-10)


### Bug Fixes

* **Mapping:** remove cascades from `field()` to `completeMapping()` ([8371b34](https://github.com/SpoonX/wetland/commit/8371b34))
* **package.json:** fix test script ([4c68853](https://github.com/SpoonX/wetland/commit/4c68853))
* **UnitOfWork:** fix typings ([d094679](https://github.com/SpoonX/wetland/commit/d094679))


### Features

* **Mapping:** add `setDefaultCascades` method ([36364e3](https://github.com/SpoonX/wetland/commit/36364e3))
* **MetaData:** add clear method for MetaData ([4cdc486](https://github.com/SpoonX/wetland/commit/4cdc486))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/SpoonX/wetland/compare/v2.5.0...v3.0.0) (2018-02-04)


### Bug Fixes

* **project:** shift foreign key policy to avoid bugs with circular refs and improve performance ([5d50d54](https://github.com/SpoonX/wetland/commit/5d50d54))



<a name="2.5.0"></a>
# [2.5.0](https://github.com/SpoonX/wetland/compare/v2.4.2...v2.5.0) (2018-01-11)


### Features

* **Mapping:** add convenience methods for pk, updatedAt and createdAt ([8156fca](https://github.com/SpoonX/wetland/commit/8156fca))



<a name="2.4.2"></a>
## [2.4.2](https://github.com/SpoonX/wetland/compare/v2.4.1...v2.4.2) (2018-01-11)


### Bug Fixes

* **EntityProxy:** compare dates on their value to prevent false positives on dirty checks ([678729a](https://github.com/SpoonX/wetland/commit/678729a))



<a name="2.4.1"></a>
## [2.4.1](https://github.com/SpoonX/wetland/compare/v2.4.0...v2.4.1) (2017-11-20)


### Bug Fixes

* **exports:** export the decorators ([2bbe99b](https://github.com/SpoonX/wetland/commit/2bbe99b))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/SpoonX/wetland/compare/v2.3.2...v2.4.0) (2017-10-16)


### Bug Fixes

* **gitbook:** add mathjax to plugins to support maths statements ([378c194](https://github.com/SpoonX/wetland/commit/378c194))
* **unitofwork:** only run process after commit after the scope is clean ([b12fda7](https://github.com/SpoonX/wetland/commit/b12fda7))
* **unitofwork:** separate cleaning tasks ([2406da0](https://github.com/SpoonX/wetland/commit/2406da0))



<a name="2.3.2"></a>
## [2.3.2](https://github.com/SpoonX/wetland/compare/v2.3.1...v2.3.2) (2017-08-21)


### Bug Fixes

* **SnapshotManager:** use nullable value for joinColumn from mapping ([ce84a91](https://github.com/SpoonX/wetland/commit/ce84a91))



<a name="2.3.1"></a>
## [2.3.1](https://github.com/SpoonX/wetland/compare/v2.3.0...v2.3.1) (2017-08-09)


### Features

* **UnitOfWork:** send afterUpdate the updated properties ([2510059](https://github.com/SpoonX/wetland/commit/2510059))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/SpoonX/wetland/compare/v2.3.0-2...v2.3.0) (2017-08-03)



<a name="2.3.0-2"></a>
# [2.3.0-2](https://github.com/SpoonX/wetland/compare/v2.3.0-1...v2.3.0-2) (2017-08-02)


### Bug Fixes

* **cleaner:** use schema builder to drop tables fixing vendor issues ([4b3794d](https://github.com/SpoonX/wetland/commit/4b3794d))


### Features

* **cleaner:** add getCleaner to wetland ([318f57f](https://github.com/SpoonX/wetland/commit/318f57f))
* **cleaner:** use del instead of rimraf for the cleaner ([914e92a](https://github.com/SpoonX/wetland/commit/914e92a))



<a name="2.3.0-1"></a>
# [2.3.0-1](https://github.com/SpoonX/wetland/compare/v2.3.0-0...v2.3.0-1) (2017-07-29)


### Bug Fixes

* **EntityProxy:** cast undefined to null for actual undefined checks ([9a7764a](https://github.com/SpoonX/wetland/commit/9a7764a))
* **Hydrator:** skip dirty for collections ([41cbfc3](https://github.com/SpoonX/wetland/commit/41cbfc3))
* **unitofwork:** fix lifecyclehooks execution ([af3af23](https://github.com/SpoonX/wetland/commit/af3af23))



<a name="2.3.0-0"></a>
# [2.3.0-0](https://github.com/SpoonX/wetland/compare/v2.2.0...v2.3.0-0) (2017-07-28)


### Bug Fixes

* **EntityInterface:** add index signature to ProxyInterface and EntityInterface ([caebb88](https://github.com/SpoonX/wetland/commit/caebb88))
* **EntityRepository:** specified return of findOne when result coerce to false ([380e1ef](https://github.com/SpoonX/wetland/commit/380e1ef))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/SpoonX/wetland/compare/v2.1.0...v2.2.0) (2017-06-22)


### Features

* **SchemaBuilder:** add support for collate and charset ([d18d9ff](https://github.com/SpoonX/wetland/commit/d18d9ff))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/SpoonX/wetland/compare/v2.0.1...v2.1.0) (2017-06-03)


### Features

* **QueryBuilder:** add support for derived tables ([e3d4de2](https://github.com/SpoonX/wetland/commit/e3d4de2))
* **QueryBuilder:** add support for distinct function ([2d4f2e3](https://github.com/SpoonX/wetland/commit/2d4f2e3))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/SpoonX/wetland/compare/v2.0.0...v2.0.1) (2017-05-29)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/SpoonX/wetland/compare/v1.6.0-1...v2.0.0) (2017-05-29)


### Features

* **Criteria:** allow setting host alias for jit fallback-abort ([7718796](https://github.com/SpoonX/wetland/commit/7718796))
* **Criteria:** automatically fall back to host alias for complex queries ([3e32ebc](https://github.com/SpoonX/wetland/commit/3e32ebc))


### BREAKING CHANGES

* **Criteria:** queries are now properly aliased as a fallback. This means that columns that exist on a host but were relied upon may now fail.



<a name="1.6.0-1"></a>
# [1.6.0-1](https://github.com/SpoonX/wetland/compare/v1.6.0-0...v1.6.0-1) (2017-05-25)



<a name="1.6.0-0"></a>
# [1.6.0-0](https://github.com/SpoonX/wetland/compare/v1.5.3...v1.6.0-0) (2017-05-25)



<a name="1.5.3"></a>
## [1.5.3](https://github.com/SpoonX/wetland/compare/v1.5.2...v1.5.3) (2017-04-12)


### Bug Fixes

* **Criteria:** fix like criteria ([5d4f706](https://github.com/SpoonX/wetland/commit/5d4f706))



<a name="1.5.2"></a>
## [1.5.2](https://github.com/SpoonX/wetland/compare/v1.5.1...v1.5.2) (2017-04-11)


### Bug Fixes

* **UnitOfWork:** call after-callbacks ([6666802](https://github.com/SpoonX/wetland/commit/6666802))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/SpoonX/wetland/compare/v1.5.0...v1.5.1) (2017-04-10)


### Bug Fixes

* **populator:** adding null property check ([1d005c9](https://github.com/SpoonX/wetland/commit/1d005c9))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/SpoonX/wetland/compare/v1.4.3...v1.5.0) (2017-04-06)



<a name="1.4.3"></a>
## [1.4.3](https://github.com/SpoonX/wetland/compare/v1.4.2...v1.4.3) (2017-04-03)


### Bug Fixes

* **examples:** fixed `setup` and `done` actions ([c321ea7](https://github.com/SpoonX/wetland/commit/c321ea7))
* **examples:** fixed `setup` and `done` actions ([5e66163](https://github.com/SpoonX/wetland/commit/5e66163))
* **SnapshotManager:** verify to-be-dropped before accessing it ([fbeb238](https://github.com/SpoonX/wetland/commit/fbeb238))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/SpoonX/wetland/compare/v1.4.1...v1.4.2) (2017-03-23)


### Bug Fixes

* **project:** export SnapshotManager ([d63bb71](https://github.com/SpoonX/wetland/commit/d63bb71))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/SpoonX/wetland/compare/v1.4.0...v1.4.1) (2017-03-14)


### Bug Fixes

* **UnitOfWork:** catch transaction rejections ([893416d](https://github.com/SpoonX/wetland/commit/893416d))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/SpoonX/wetland/compare/v1.3.1...v1.4.0) (2017-03-13)


### Features

* **project:** add decorators ([6d3766c](https://github.com/SpoonX/wetland/commit/6d3766c))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/SpoonX/wetland/compare/v1.3.0...v1.3.1) (2017-03-08)


### Bug Fixes

* **cli:** remove extra exclamation mark ([ea8f57e](https://github.com/SpoonX/wetland/commit/ea8f57e))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/SpoonX/wetland/compare/v1.2.0...v1.3.0) (2017-02-20)


### Bug Fixes

* **QueryBuilder:** use alias instead of property name ([1818f1a](https://github.com/SpoonX/wetland/commit/1818f1a))


### Features

* **EntityRepository:** expose mapping ([b59ec8e](https://github.com/SpoonX/wetland/commit/b59ec8e))
* **Mapping:** add getType method ([babe5f7](https://github.com/SpoonX/wetland/commit/babe5f7))
* **QueryBuilder:** add alias support and support json ([18e4b87](https://github.com/SpoonX/wetland/commit/18e4b87))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/SpoonX/wetland/compare/v1.1.0...v1.2.0) (2017-02-07)


### Bug Fixes

* **entity:** toObject failed if there was no relations ([bb9bec2](https://github.com/SpoonX/wetland/commit/bb9bec2))
* **populate:** add date support and fix populate logic bugs ([841fa23](https://github.com/SpoonX/wetland/commit/841fa23))
* **UnitOfWork:** add logging and fix state bug ([8375616](https://github.com/SpoonX/wetland/commit/8375616))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/SpoonX/wetland/compare/v1.0.1...v1.1.0) (2017-01-22)


### Features

* **EntityProxy:** allow setting of same collection ([d356b97](https://github.com/SpoonX/wetland/commit/d356b97))
* **Mapping:** set default cascades ([4be6aaa](https://github.com/SpoonX/wetland/commit/4be6aaa))
* **project:** add default cascades option ([eb04066](https://github.com/SpoonX/wetland/commit/eb04066))
* **Scope:** register reference with identity map ([c82e7ca](https://github.com/SpoonX/wetland/commit/c82e7ca))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/SpoonX/wetland/compare/v1.0.0...v1.0.1) (2017-01-15)


### Bug Fixes

* **EntityRepository:** check for null ([d3607a7](https://github.com/SpoonX/wetland/commit/d3607a7))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/SpoonX/wetland/compare/v1.0.0-4...v1.0.0) (2017-01-15)


### Bug Fixes

* **EntityRepository:** do not assume relations exist ([3f44538](https://github.com/SpoonX/wetland/commit/3f44538))



<a name="1.0.0-4"></a>
# [1.0.0-4](https://github.com/SpoonX/wetland/compare/v1.0.0-3...v1.0.0-4) (2017-01-10)


### Bug Fixes

* **Entity:** toObject without properties and add relations ([b376722](https://github.com/SpoonX/wetland/commit/b376722))



<a name="1.0.0-3"></a>
# [1.0.0-3](https://github.com/SpoonX/wetland/compare/v1.0.0-2...v1.0.0-3) (2017-01-04)



<a name="1.0.0-2"></a>
# [1.0.0-2](https://github.com/SpoonX/wetland/compare/v1.0.0-1...v1.0.0-2) (2017-01-04)


### Bug Fixes

* **cli:** use node modules from cwd ([f8eb135](https://github.com/SpoonX/wetland/commit/f8eb135))



<a name="1.0.0-1"></a>
# [1.0.0-1](https://github.com/SpoonX/wetland/compare/v1.0.0-0...v1.0.0-1) (2017-01-04)


### Bug Fixes

* **entitymanager:** remove constructor to denormalize ([588281b](https://github.com/SpoonX/wetland/commit/588281b))
* **Mapping:** prevent duplicate applied mappings ([6a53505](https://github.com/SpoonX/wetland/commit/6a53505))
* **UnitOfWork:** prevent losing index on loop ([56a6014](https://github.com/SpoonX/wetland/commit/56a6014))


### Features

* **arraycollection:** add each method to loop indexless ([3591fbd](https://github.com/SpoonX/wetland/commit/3591fbd))
* **criteria:** add possibility to use alias as key ([b68a7a2](https://github.com/SpoonX/wetland/commit/b68a7a2))
* **Entity:** add base entity class for toObject method ([9d3d4ef](https://github.com/SpoonX/wetland/commit/9d3d4ef))
* **Hydrator:** add nested hydration for collections ([e702454](https://github.com/SpoonX/wetland/commit/e702454))
* **populate:** add populator to assign from pojo ([3562f2a](https://github.com/SpoonX/wetland/commit/3562f2a))
* **project:** Implemented lifecycle callbacks ([f7b2646](https://github.com/SpoonX/wetland/commit/f7b2646))
* **Query:** support child queries ([1c2ebe0](https://github.com/SpoonX/wetland/commit/1c2ebe0))
* **QueryBuilder:** add populate and quickJoin ([cdf6880](https://github.com/SpoonX/wetland/commit/cdf6880))



<a name="1.0.0-0"></a>
# [1.0.0-0](https://github.com/SpoonX/wetland/compare/d82db41...v1.0.0-0) (2016-11-14)


### Bug Fixes

* **constructor:** fix entityPath resolution ([e87fb8e](https://github.com/SpoonX/wetland/commit/e87fb8e))
* **constructor:** support entities as es6 default export ([2b529bd](https://github.com/SpoonX/wetland/commit/2b529bd))
* **logo:** also update doc/readme ([8a6d946](https://github.com/SpoonX/wetland/commit/8a6d946))
* **logo:** change URL to circumvent CDN cache ([9171c22](https://github.com/SpoonX/wetland/commit/9171c22))
* **logo:** fix kerning and add missing shadow ([8ef1b90](https://github.com/SpoonX/wetland/commit/8ef1b90))
* **logo:** svg logo in readme :art: ([beda683](https://github.com/SpoonX/wetland/commit/beda683))
* **mapping:** make mapping work with fallback column name ([714f086](https://github.com/SpoonX/wetland/commit/714f086))
* **Mapping:** Allow missing fields ([f833ea1](https://github.com/SpoonX/wetland/commit/f833ea1))
* **Mapping:** Check for EntityProxy ([27ca374](https://github.com/SpoonX/wetland/commit/27ca374))
* **Mapping:** Prevent duplicate column definitions ([c872c2f](https://github.com/SpoonX/wetland/commit/c872c2f))
* **MetaData:** Use target when proxy ([a0cdeab](https://github.com/SpoonX/wetland/commit/a0cdeab))
* **package.json:** fix path to "main" and "typings" ([2029d6a](https://github.com/SpoonX/wetland/commit/2029d6a))
* **project:** Add missing dependencies ([81000b5](https://github.com/SpoonX/wetland/commit/81000b5))
* **QueryBuilder:** Accept fields without name (PK) ([834a51b](https://github.com/SpoonX/wetland/commit/834a51b))
* **QueryBuilder:** Call correct method for order by ([2cfd964](https://github.com/SpoonX/wetland/commit/2cfd964))
* **QueryBuilder:** Set initial object literal ([92f8758](https://github.com/SpoonX/wetland/commit/92f8758))
* **QueryBuilder:** Use actual PK, and also only once ([7eeb25a](https://github.com/SpoonX/wetland/commit/7eeb25a))
* **QueryBuilder:** Use table as from on update and delete. ([9b0cded](https://github.com/SpoonX/wetland/commit/9b0cded))
* **SchemaBuilder:** Set cascade delete for join table ([c7974bd](https://github.com/SpoonX/wetland/commit/c7974bd))
* **test:** Fixed broken tests ([6722c65](https://github.com/SpoonX/wetland/commit/6722c65))
* **test:** Removed unused module ([d41f809](https://github.com/SpoonX/wetland/commit/d41f809))
* **UnitOfWork:** clear transactions after commitOrRollback ([662898f](https://github.com/SpoonX/wetland/commit/662898f))
* **UnitOfWork:** Pick property from owning side ([7eb46d1](https://github.com/SpoonX/wetland/commit/7eb46d1))
* **UnitOfWork:** Removed typo ([18de52f](https://github.com/SpoonX/wetland/commit/18de52f))
* **UnitOfWork:** Use entity reference when proxy ([3c9b57b](https://github.com/SpoonX/wetland/commit/3c9b57b))
* **UnitOfWork:** Use entity reference when proxy ([86e6fb5](https://github.com/SpoonX/wetland/commit/86e6fb5))


### Features

* **bin:** Added CLI tool ([8a15ee7](https://github.com/SpoonX/wetland/commit/8a15ee7))
* **cli:** add advanced cli tools for wetland ([b0860b3](https://github.com/SpoonX/wetland/commit/b0860b3))
* **Criteria:** add `on` criteria parser ([53e6073](https://github.com/SpoonX/wetland/commit/53e6073))
* **Criteria:** allow staging for specific statement ([75cc720](https://github.com/SpoonX/wetland/commit/75cc720))
* **Criteria:** refactor to use new criteria parser, use for having ([6f9f63e](https://github.com/SpoonX/wetland/commit/6f9f63e))
* **EntityProxy:** Allow bypassing dirty-check ([a5a78f7](https://github.com/SpoonX/wetland/commit/a5a78f7))
* **Hydrator:** Added a hydrator ([d82db41](https://github.com/SpoonX/wetland/commit/d82db41))
* **IdentityMap:** Added a IdentityMap ([d79dd6d](https://github.com/SpoonX/wetland/commit/d79dd6d))
* **logo:** add logo :art: ([a3b5099](https://github.com/SpoonX/wetland/commit/a3b5099))
* **mapping:** add serialize, restore and index processing ([ef1e363](https://github.com/SpoonX/wetland/commit/ef1e363))
* **mapping:** Added property scoping and more mapping methods ([397fe59](https://github.com/SpoonX/wetland/commit/397fe59))
* **mapping:** Auto column names to underscore ([0560d62](https://github.com/SpoonX/wetland/commit/0560d62))
* **mapping:** Table name to underscore ([099047a](https://github.com/SpoonX/wetland/commit/099047a))
* **Mapping:** add tolerant field fetching ([6ab210b](https://github.com/SpoonX/wetland/commit/6ab210b))
* **MetaData:** Ensure same reference ([f64fdef](https://github.com/SpoonX/wetland/commit/f64fdef))
* **MigrationFile:** Ensure migration dir exists ([0fa2925](https://github.com/SpoonX/wetland/commit/0fa2925))
* **migrations:** Added migrator ([b8c0a89](https://github.com/SpoonX/wetland/commit/b8c0a89))
* **migrations:** Added schema builder ([7e99ea9](https://github.com/SpoonX/wetland/commit/7e99ea9))
* **MigrationTable:** get all run migrations ([dfaac32](https://github.com/SpoonX/wetland/commit/dfaac32))
* **Migrator:** add dev migrations ([7bd9e8f](https://github.com/SpoonX/wetland/commit/7bd9e8f))
* **Migrator:** add option to write code to migration ([4d752a2](https://github.com/SpoonX/wetland/commit/4d752a2))
* **Migrator:** Added migration support ([cd5d63d](https://github.com/SpoonX/wetland/commit/cd5d63d))
* **project:** Added joins, recursive persistence, hydrations et all. ([576a281](https://github.com/SpoonX/wetland/commit/576a281))
* **project:** Added travis CI checks ([d116ff2](https://github.com/SpoonX/wetland/commit/d116ff2))
* **project:** Setup configurable debugging ([e46ae63](https://github.com/SpoonX/wetland/commit/e46ae63))
* **querybuilder:** Added `.having()` ([eab19c0](https://github.com/SpoonX/wetland/commit/eab19c0))
* **querybuilder:** Added `groupBy` clause ([3fad91a](https://github.com/SpoonX/wetland/commit/3fad91a))
* **QueryBuilder:** add join method for custom behavior ([d170387](https://github.com/SpoonX/wetland/commit/d170387))
* **QueryBuilder:** Support .now() default for timestamps ([d70a8a1](https://github.com/SpoonX/wetland/commit/d70a8a1))
* **SchemaBuilder:** add option for optional foreign key usage ([367eca9](https://github.com/SpoonX/wetland/commit/367eca9))
* **SchemaBuilder:** Added support for foreign keys in mapping ([c0e0774](https://github.com/SpoonX/wetland/commit/c0e0774))
* **SchemaBuilder:** generate code from mapping diff ([00cfb2a](https://github.com/SpoonX/wetland/commit/00cfb2a))
* **SchemaBuilder:** Implement sqlite support ([88d3b23](https://github.com/SpoonX/wetland/commit/88d3b23))
* **scope:** Added .getEntities() method ([99ecee2](https://github.com/SpoonX/wetland/commit/99ecee2))
* **Scope:** Allow getting default store ([afe4e8a](https://github.com/SpoonX/wetland/commit/afe4e8a))
* **Wetland:** Add fallback store (sqlite3) ([5eed4a5](https://github.com/SpoonX/wetland/commit/5eed4a5))
* **Wetland:** add schema and snapshot ([a60d6f5](https://github.com/SpoonX/wetland/commit/a60d6f5))
* **Wetland:** Allow entityPath and entityPaths as config options to autoload entities ([733b92f](https://github.com/SpoonX/wetland/commit/733b92f))



