const createLineReader = require('@taluoo/node-line-reader');

/**
 * 对比 oldFile 和 newFile
 * @param oldFile
 * @param newFile
 * @return {Promise} 对比结束时，返回 newFile 相较于 oldFile 新增的行
 */
async function diffFile(oldFile, newFile) {
    return new Promise(function (resolve, reject) {
        let oldFileReader = createLineReader(oldFile);
        let oldLines = [];

        oldFileReader.on('error', err => {
            console.log(`读取 ${oldFile} 出错`);
            reject(err);
        });
        oldFileReader.on('line', line => {
            oldLines.push(line);
        });

        oldFileReader.on('end', () => {
            let newFileReader = createLineReader(newFile);
            let newLines = [];

            newFileReader.on('error', err => {
                console.log(`读取 ${newFile} 出错`);
                reject(err);
            });
            newFileReader.on('line', line => {
                if (oldLines.indexOf(line) === -1) {
                    newLines.push(line);
                }
            });
            newFileReader.on('end', () => {
                resolve(newLines);
            });
        });
    })
}

module.exports = diffFile;