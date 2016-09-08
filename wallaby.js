module.exports = function(w) {
  return {
    files        : [
      'src/**/*.ts',
      'test/resource/**/*.ts'
    ],
    tests        : [
      'test/**/*.test.ts'
    ],
    env          : {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'mocha',
    debug        : true,
    compilers    : {
      '**/*.ts': w.compilers.typeScript({module: 'commonjs', "experimentalDecorators": true,
        "emitDecoratorMetadata": true})
    }
  };
};
