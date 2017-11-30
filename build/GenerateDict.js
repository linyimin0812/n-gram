"use strict";
/**
 * @author: 林贻民
 * @description: 将语料生成词典并写入dict.txt文件中
 */
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const fs = require("fs");
let rl = readline.createInterface({
    input: fs.createReadStream("./src/file/北大(人民日报)语料库199801.txt")
});
let writeStream = fs.createWriteStream("./src/file/dict.txt");
// 保存单词的统计信息
let dict = {};
// 保存词表中单词的个数(不含重复的词)
dict["count"] = 0;
// 保存词表中单词的个数(含重复的单词)
dict["number"] = 0;
rl.on('line', (line) => {
    let data = line.split("  ");
    for (let i = 1; i < data.length; i++) {
        let temp = data[i].split("/")[0];
        // 该词已经出现过
        if ('' != temp && dict[temp]) {
            dict[temp] = dict[temp] + 1;
        }
        else if ('' != temp) {
            dict[temp] = 1;
            dict["number"]++;
        }
        if ('' != temp) {
            dict["count"]++;
        }
        // 计算两个词同时出现的次数
        if (i < data.length - 1) {
            let left = data[i].split("/")[0];
            let right = data[i + 1].split("/")[0];
            let towWords = left + "," + right;
            if ('' != right && dict[towWords]) {
                dict[towWords] = dict[towWords] + 1;
            }
            else if ('' != right) {
                dict[towWords] = 1;
            }
        }
    }
});
rl.on("close", () => {
    writeStream.write(JSON.stringify(dict));
});
