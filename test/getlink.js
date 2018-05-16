const puppeteer = require('puppeteer');

// 用于测试 target 的自定义 getLinkFromPage 函数

let target = {
    url: '',
    getLinkFromPage: async function (page) {
        // custom get link from page logic

    }
};

async function getDownloadLinks(target) {
    console.log('开始获取下载链接');
    console.log('1. 启动 puppeteer');
    const browser = await puppeteer.launch({
        headless: false,
        // slowMo: 250 // slow down by 250ms
    });
    const page = await browser.newPage();
    page.on('load', async function () {
        try {
            let url = await target.getLinkFromPage(page);
            console.log(`getDownloadLink OK：${url}`);
        } catch (e) {
            console.log(e);
        } finally {
            browser.close();
        }
    });
    await page.goto(target.url);
}

getDownloadLinks(target);