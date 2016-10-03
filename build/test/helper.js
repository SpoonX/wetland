"use strict";
const fs = require('fs');
const path = require('path');
process.setMaxListeners(0);
let tmpTestDir = path.join(__dirname, '.tmp');
let clearTmpDir = () => {
    try {
        fs.readdirSync(tmpTestDir).forEach(file => {
            fs.unlinkSync(path.join(tmpTestDir, file));
        });
        fs.rmdirSync(tmpTestDir);
    }
    catch (e) {
    }
};
before((done) => {
    clearTmpDir();
    fs.mkdir(tmpTestDir, done);
});
after(() => {
    clearTmpDir();
});
