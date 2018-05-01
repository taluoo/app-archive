const Path = require('path');
const fs = require('fs');
const Util = require('util');
const renameFile = Util.promisify(fs.rename);

const moment = require('moment');
const chalk = require('chalk');
const {clone} = require('@taluoo/node-clone-url');

const Logger = require('../util/logger');

const error = chalk.bold.red;

/**
 * 下载 APP
 * @param url : APP 的 URL
 * @param platform : APP 的平台，用来命名 md5 和 log 文件
 * @param dir : APP 要保存的目录
 * @return {Promise.<void>}
 */
async function download(url, platform, dir) {
    let md5File = Path.join(dir, `${platform}_md5.txt`);
    let logFile = Path.join(dir, `${platform}_log.txt`);
    prepareFile(dir, md5File, logFile);
    let logger = new Logger(logFile);

    try {
        console.log(`开始下载 ${url}`);
        let appFile = await clone(url, dir);
        let pathObj = Path.parse(appFile);

        let md5 = pathObj.base.slice(0, pathObj.base.indexOf('.'));
        // console.log(`当前 APP MD5: ${md5}`);
        let currentMD5 = fs.readFileSync(md5File, {encoding: 'utf8'});
        // console.log(`最新 MD5: ${currentMD5}`);

        if (md5 !== currentMD5) { // md5 有变化，重命名文件（加上时间），改写 md5
            let timeStr = moment().format('YYYY-MM-DD_HH-mm-ss');
            let saveTo = Path.join(pathObj.dir, timeStr, pathObj.base); // 在路径中插入一级文件夹，以时间命名
            saveAPP(appFile, saveTo);
            logger.log(`${timeStr} ${md5} ${url}`);
            updateMD5(md5File, md5);
        } else {
            console.log(`相同 MD5 APP 已存在，清理下载文件`);
            deleteAPP(appFile);
        }
    } catch (e) {
        console.log(error(`${url} 下载失败`));
        logger.log(`${url} 下载失败`);
        logger.log(e);
    }
}

/**
 * 准备所需文件夹和文件（注意：使用同步的方式）
 * @param dir
 * @param md5File
 * @param logFile
 */
function prepareFile(dir, md5File, logFile) {
    try {
        console.log(`准备目录 ${dir} ...`);
        fs.mkdirSync(dir);
    } catch (e) {
        if (e.code === 'EEXIST') {
            // console.log(`目录已存在`)
        } else {
            console.log(error(`新建 ${dir} 出错了：`));
            console.log(e);
        }
    }
    console.log(`准备其 md5 和 log 文件 ...`);
    [md5File, logFile].forEach(file => {
        try {
            fs.writeFileSync(file, '', {flag: 'wx'});
        } catch (e) {
            if (e.code === 'EEXIST') {
                // console.log(`文件已存在`);
            } else {
                console.log(error(`新建 ${file} 出错了：`));
                console.log(e);
            }
        }
    });
}

/**
 * 更新 MD5 值
 * @param md5File
 * @param md5
 */
function updateMD5(md5File, md5) {
    fs.writeFile(md5File, md5, err => {
        if (err) {
            console.log(error(`写入 MD5 失败：${md5File}`));
        }
    })
}

/**
 * 保存 APP 文件
 * @param appFile
 * @param saveTo
 */
function saveAPP(appFile, saveTo) {
    console.log(`保存 APP 到 ${saveTo}`);
    let savePath = Path.dirname(saveTo);
    fs.mkdir(savePath, err => {
        if (err) {
            console.log(error(`创建文件夹 ${savePath} 失败`))
        } else {
            renameFile(appFile, saveTo);
        }
    });
}

/**
 * 删除下载的 APP 文件
 * @param appFile
 */
function deleteAPP(appFile) {
    fs.unlink(appFile, (err) => {
        if (err) {
            console.log(error(`删除文件 ${appFile} 失败`));
        } else {
            // console.log(`删除文件 ${appFile} 成功`)
        }
    })
}

module.exports = download;