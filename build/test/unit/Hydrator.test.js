//
// class Bar extends EntityRepository {
//
// }
//
// describe('Mapping', () => {
//   describe('static .forEntity()', () => {
//     let mapping = Mapping.forEntity(resource.Field);
//
//     class Group {}
//     class User {}
//
//     // mapping.manyToMany('groups', {
//     //   targetEntity: Group,
//     //   inversedBy  : 'users',
//     //   cascade     : ['persist', 'remove']
//     // });
//     //
//     // mapping.throughEntity({
//     //   name: 'group_user',
//     //   joinColumns: [{name: 'group_id', referencedColumnName: 'id'}],
//     //   inverseJoinColumns: [{name: 'user_id', referencedColumnName: 'id'}]
//     // });
//     //
//     //
//     //
//     // mapping.manyToMany('users', {
//     //   targetEntity: User,
//     //   mappedBy: 'groups'
//     // });
//
//     // console.log(mapping.mapping.data);
//   });
// });
