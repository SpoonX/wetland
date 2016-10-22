module.exports = function(w) {
  return {
    files        : [
      'src/**/*.ts',
      'src/**/*.dist',
      'test/resource/**/*.ts'
    ],
    tests        : [
      'test/helper.ts',
      'test/**/*.spec.ts'
    ],
    env          : {
      type  : 'node',
      runner: 'node'
    },
    workers      : {
      recycle: true
    },
    testFramework: 'mocha',
    debug        : false,
    compilers    : {
      '**/*.ts': w.compilers.typeScript({
        module                 : 'commonjs', "experimentalDecorators": true,
        "emitDecoratorMetadata": true
      })
    }
  };
};
