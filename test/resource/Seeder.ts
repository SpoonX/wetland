import * as path from 'path';
import * as Bluebird from 'bluebird';
import * as rimraf from 'rimraf';

export const tmpTestDir  = path.join(__dirname, '../.tmp');
export const dataDir     = `${tmpTestDir}/.data`;
export const fixturesDir = path.join(__dirname, '../resource/fixtures/');

export class User {
  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('username').field({ type: 'string' });
    mapping.forProperty('password').field({ type: 'string' });
    mapping.forProperty('posts').oneToMany({ targetEntity: Post, mappedBy: 'author' });
  }
}

export class Post {
  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('title').field({ type: 'string' });
    mapping.forProperty('content').field({ type: 'text' });
    mapping.forProperty('author').manyToOne({ targetEntity: User, inversedBy: 'posts' });
  }
}

export class Pet {
  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('name').field({ type: 'string' });
  }
}

export function getType (bypassLifecyclehooks: boolean): string {
  return bypassLifecyclehooks ? 'nolifecycle' : 'lifecycle';
}

export function rmDataDir (): Promise<any> {
  const rmDir: any = Bluebird.promisify(rimraf);

  return rmDir(dataDir);
}
