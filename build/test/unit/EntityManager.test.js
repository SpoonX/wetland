"use strict";
describe('EntityManager', () => {
    describe('.persist()', () => {
        it('should persist an entity to the unitOfWork', () => {
        });
    });
});
// import {EntityManager, Scope} from '../../src/EntityManager';
// import {EntityRepository} from '../../src/EntityRepository';
// import {Field} from '../resource/decorator/field';
// import {assert} from 'chai';
//
// describe('EntityManager', () => {
//   describe('createScope()', () => {
//     it('Should create a scope', () => {
//       let entityManager = new EntityManager();
//       let scope         = entityManager.createScope();
//       assert.instanceOf(scope, Scope);
//     });
//   });
//   describe('registerEntity()', () => {
//     it('Should register entity with the given key', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntity('bar', Field);
//       assert(entityManager.entities.get('bar') === Field);
//     });
//   });
//   describe('registerEntities()', () => {
//     it('Should registerEntities with their name lowered case as key', () => {
//       class Foo {
//       }
//       class TomTom {
//       }
//       let entityManager = new EntityManager();
//       entityManager.registerEntities([
//         Foo, Field, TomTom
//       ]);
//       assert(entityManager.entities.get('foo') == Foo);
//       assert(entityManager.entities.get('field') == Field);
//       assert(entityManager.entities.get('tomtom') == TomTom);
//     });
//   });
//
//   describe('getRepository()', () => {
//     it('Should return a repository given a string', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntities([Field]);
//       let repository = entityManager.getRepository('field');
//       assert(repository instanceof EntityRepository);
//     });
//     it('Should return a repository given a class', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntities([Field]);
//       let repository = entityManager.getRepository(Field);
//       assert(repository instanceof EntityRepository);
//     });
//     it('Should return a repository given an instance of the class', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntities([Field]);
//       let repository = entityManager.getRepository(new Field());
//       assert(repository instanceof EntityRepository);
//     });
//   });
//
//   describe('getEntitySchema', () => {
//     it('Should return an entity given a string', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntity('field', Field);
//       let schema = entityManager.getEntitySchema('field');
//       assert(schema.fields.id.type == 'number');
//       assert(schema.entity.name == 'field');
//     });
//     it('Should return an entity given a class', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntity('field', Field);
//       let schema = entityManager.getEntitySchema(Field);
//       assert(schema.fields.id.type == 'number');
//       assert(schema.entity.name == 'field');
//     });
//     it('Should return an entity given an instance of the class', () => {
//       let entityManager = new EntityManager();
//       entityManager.registerEntity('field', Field);
//       let schema = entityManager.getEntitySchema(new Field());
//       assert(schema.fields.id.type == 'number');
//       assert(schema.entity.name == 'field');
//     });
//   });
// });
