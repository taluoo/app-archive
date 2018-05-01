const Path = require('path');
const createLineReader = require('@taluoo/node-line-reader');

const download = require('./download');

/**
 * 从 linksLogFile 读取下载链接，并下载
 * @param linksLogFile
 * @param repoDir
 */
function downloadAPP(linksLogFile, repoDir) {
    console.log('开始下载 APP');
    let lineReader = createLineReader(linksLogFile);
    lineReader.on('error', err => {
        console.log(`读取 ${linksLogFile} 出错`);
        console.log(err);
    });
    lineReader.on('end', () => {
        console.log(`读取 ${linksLogFile} 完成`);
    });
    lineReader.on('line', line => {
        try {
            let target = JSON.parse(line);
            download(target.url, target.platform, Path.join(repoDir, target.folder));
        } catch (e) {
            console.log(e);
        }
    });
}

module.exports = downloadAPP;