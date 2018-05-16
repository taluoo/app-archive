module.exports = {
    'qq_mac': {
        url: 'https://mac.qq.com/?from=pcqq',
        des: 'QQ',
        platform: 'mac',
        folder: 'qq',
        selector: 'a[data-stat="main.down.qq"]',
    },
    'qq_browser_mac': {
        url: 'https://mac.qq.com/?from=pcqq',
        des: 'QQ Browser',
        platform: 'mac',
        folder: 'qq_browser',
        selector: 'a[data-stat="main.down.qb"]',
    },
    'qywx_mac': {
        url: 'https://mac.qq.com/?from=pcqq',
        des: '企业微信',
        platform: 'mac',
        folder: 'qywx',
        selector: 'a[data-stat="main.down.qywx"]',
    },
    'qq_video_mac': {
        url: 'https://mac.qq.com/?from=pcqq',
        des: '腾讯视频',
        platform: 'mac',
        folder: 'qq_video',
        selector: 'a[data-stat="main.down.qv"]',
    },
    'qq_docs_android': {
        url: 'https://docs.qq.com/',
        des: '腾讯文档',
        platform: 'android',
        folder: 'qq_docs',
        selector: '#id-download-android',
    },
    'qq_tim_android': {
        url: 'http://tim.qq.com/download.html',
        des: 'QQ TIM',
        platform: 'android',
        folder: 'qq_tim',
        selector: '.down-ietm.android .down-btn a',
    },
    'qq_tim_windows': {
        url: 'http://tim.qq.com/download.html',
        des: 'QQ TIM',
        platform: 'windows',
        folder: 'qq_tim',
        selector: '.down-ietm.windows .down-btn a',
    },
    'qq_weiyun_mac': {
        url: 'https://www.weiyun.com/download.html',
        des: 'QQ WeiYun',
        platform: 'mac',
        folder: 'qq_weiyun',
        getLinkFromPage: async function (page) {
            try {
                await page.setRequestInterception(true);// 后面的 click 会导致下载，所以拦截一下
                page.on('request', interceptedRequest => {
                    if (interceptedRequest.url().endsWith('.dmg'))
                        interceptedRequest.abort();
                    else
                        interceptedRequest.continue();
                });
                await page.click('a[data-action=downloadClient]'); // 根据页面逻辑，点击连接之后，#downloadIframe 的 src 会改为下载链接
                let iframe = await page.$('#downloadIframe');
                let src = await iframe.getProperty('src');
                return await src.jsonValue();
            } catch (e) {
                throw new Error(`qq_weiyun_mac 下载链接提取失败`);
            }
        }
    }
};