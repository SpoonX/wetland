const gulp = require('gulp');

gulp.task('build', ['copyFiles']);
gulp.task('copyFiles', () => {
  gulp.src(['./src/**/*', '!./**/*.ts']).pipe(gulp.dest('dist/src'))
});

gulp.task('watch', ['build'], () => gulp.watch(['./src/**/*', '!./**/*.ts'], ['build']));
