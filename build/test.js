"use strict";
/**
 * @author: 林贻民
 * @description: 调用Segment类完成对测试数据的切分，并将分词结果保存到2017140433.txt文件中
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Segement_1 = require("./Segement");
const readline = require("readline");
const fs = require("fs");
var iconv = require("iconv-lite");
let rl = readline.createInterface({
    input: fs.createReadStream("./src/file/testset.txt")
});
let segment = new Segement_1.Segment();
let finalResult = "";
let count = 0;
rl.on("line", (line) => {
    let result = segment.segment(line);
    let bestLAW = segment.getBestLAM(result);
    count++;
    if (count != 100) {
        finalResult += segment.getresult(bestLAW, line.length - 1) + "\n";
    }
    else {
        finalResult += segment.getresult(bestLAW, line.length - 1);
    }
    //console.log(finalResult);
});
// let data = fs.readFileSync("../src/file/testset.txt").toString();
rl.on("close", () => {
    let writeStream = fs.createWriteStream("./src/file/temp.txt");
    writeStream.write(finalResult);
    fs.createReadStream('./src/file/temp.txt')
        .pipe(iconv.decodeStream('utf-8'))
        .pipe(iconv.encodeStream('gbk'))
        .pipe(fs.createWriteStream('./src/file/2017140433.txt'));
    fs.unlinkSync("./src/file/temp.txt");
});