const fs = require('fs');
/**
 * 适用于记录到一个日志文件
 */
class Logger {
    /**
     *
     * @param logFilePath 日志文件 path
     * @param log2console 是否同时输出到控制台
     */
    constructor(logFilePath, log2console = false) {
        this.logFilePath = logFilePath;
        this.log2console = log2console;
    }

    log(msg, log2console = false) {
        fs.appendFileSync(this.logFilePath, `${msg}\r\n`);
        if (this.log2console && log2console) {
            console.log(msg);
        }
    }
}

module.exports = Logger;