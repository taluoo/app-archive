const fs = require('fs');
const puppeteer = require('puppeteer');

const Logger = require('../util/logger');

/**
 * 从 config 读取配置，通过浏览器获取下载链接，把结果写入 resultFile
 * @param config
 * @param resultFile
 * @return {Promise.<void>} 浏览器关闭后，resolve(true)
 */
async function getDownloadLinks(config, resultFile) {
    console.log('开始获取下载链接');
    console.log('1. 启动 puppeteer');
    const browser = await puppeteer.launch({
        headless: false,
        // slowMo: 250 // slow down by 250ms
    });
    return new Promise(function (resolve, reject) {
        browser.on('targetdestroyed', async target => { // 每当有页面关闭时触发
            let pages = await browser.pages();
            if (pages.length <= 1) {
                console.log('页面都已关闭，1s 后关闭浏览器');
                setTimeout(() => {
                    browser.close();
                    resolve(true);
                }, 1000)
            }
        });
        fs.openSync(resultFile, 'w'); // w : Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
        let logger = new Logger(resultFile, true);

        console.log('2. 遍历 config target');
        Object.keys(config).forEach(async (item) => {
            let target = config[item];
            const page = await browser.newPage();
            page.on('load', async function () {
                try {
                    let url = '';
                    if ('getLinkFromPage' in target) { // 如果 target 包含自定义 getLinkFromPage 函数
                        url = await target.getLinkFromPage(page);
                    } else {
                        url = await getLinkFromPage(page, `${target.des} for ${target.platform}`, `${target.selector}`);
                    }
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
    });
}

/**
 * 从页面中提取下载链接
 * @param page puppeteer page 实例
 * @param des APP 描述
 * @param selector 包含下载链接的元素的选择器
 * @param property 包含下载链接的属性名
 * @return {Promise.<*>} 成功时，返回下载链接
 */
async function getLinkFromPage(page, des, selector, property = 'href') {
    try {
        let element = await page.$(selector);
        let href = await element.getProperty(property);
        return await href.jsonValue();
    } catch (e) {
        throw new Error(`${des} 下载链接提取失败`);
    }
}

module.exports = getDownloadLinks;