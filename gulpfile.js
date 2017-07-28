const gulp = require('gulp');

gulp.task('build', ['copyFiles']);
gulp.task('copyFiles', () => {
  gulp.src(['./test/resource/fixtures/**/**/*']).pipe(gulp.dest('dist/test/resource/fixtures/'));
  gulp.src(['./src/**/*', '!./**/*.ts']).pipe(gulp.dest('dist/src'));
});

gulp.task('watch', ['build'], () => gulp.watch(['./src/**/*', '!./**/*.ts', './test/resource/fixtures/**/**/*'], ['build']));
