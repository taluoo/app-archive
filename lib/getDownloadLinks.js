const fs = require('fs');
const puppeteer = require('puppeteer');

const Logger = require('../util/logger');

/**
 * 从 config 读取配置，通过浏览器获取下载链接，把结果写入 resultFile
 * @param config
 * @param resultFile
 * @return {Promise.<void>}
 */
async function getDownloadLinks(config, resultFile) {
    console.log('开始获取下载链接');
    console.log('1. 启动 puppeteer');
    const browser = await puppeteer.launch({
        headless: false,
        // slowMo: 250 // slow down by 250ms
    });
    fs.openSync(resultFile, 'w'); // w : Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
    let logger = new Logger(resultFile, true);

    console.log('2. 遍历 config target');
    Object.keys(config).forEach(async (item) => {
        let target = config[item];
        const page = await browser.newPage();
        page.on('load', async function () {
            try {
                let url = await target.getDownloadLink(page);
                console.log(`${item} getDownloadLink OK：${url}`);
                let result = {
                    url,
                    platform: target.platform,
                    folder: target.folder,
                    des: target.des
                };
                logger.log(JSON.stringify(result));
            } catch (e) {
                logger.log(`${target.des} for ${target.platform} 下载出错`, true);
                console.log('\x1b[31m%s\x1b[0m', e);
                console.log(e);
            } finally {
                page.close();
            }
        });
        await page.goto(target.url);
    });
}

module.exports = getDownloadLinks;