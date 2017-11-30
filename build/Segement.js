"use strict";
/**
 * @author: 林贻民
 * @description: 对测试数据集进行简单划分，求最佳左连接词，返回分词结果
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class Word {
    constructor(p_num, p_begin, p_end, p_word, p_rate, plus_rate, p_best) {
        this.word = {};
        // 标记为第几个词
        this.word.p_num = p_num;
        // 该词在句子中的开始索引
        this.word.p_begin = p_begin;
        // 该词在句子中的结束索引
        this.word.p_end = p_end;
        // 词本身
        this.word.p_word = p_word;
        // 该词在词表中出现的概率
        this.word.p_rate = p_rate;
        // 该词对应的累积概率
        this.word.plus_rate = plus_rate;
        // 该词对应的最佳左连接词
        this.word.p_best = p_best;
    }
    setWord(p_num, p_begin, p_end, p_word, p_rate, plus_rate, p_best) {
        this.word.p_num = p_num;
        this.word.p_begin = p_begin;
        this.word.p_end = p_end;
        this.word.p_word = p_word;
        this.word.p_rate = p_rate;
        this.word.plus_rate = plus_rate;
        this.word.p_best = p_best;
    }
    getWord() {
        return this.word;
    }
}
class Segment {
    segment(statement) {
        // 导入词典文件，并转成JSON格式
        let data = fs.readFileSync("./src/file/dict.txt");
        let dict = JSON.parse(data.toString());
        let result = [];
        let count = 0;
        for (let i = 0; i < statement.length; i++) {
            let tempStr = "";
            for (let j = i; j < statement.length && j < (20 + i); j++) {
                tempStr += statement[j];
                // 该词存在
                if (dict[tempStr] || j == i) {
                    count++;
                    let p_rate = 0;
                    let plus_rate = 0;
                    let p_best = 0;
                    if (dict[tempStr]) {
                        p_rate = dict[tempStr] / dict["count"];
                    }
                    else {
                        // 不存在的词进行Laplace平滑
                        p_rate = 1 / (dict["count"] + 1);
                    }
                    // 开头词
                    if (i == 0) {
                        plus_rate = p_rate;
                        p_best = 0;
                    }
                    else {
                        plus_rate = -1;
                        p_best = -1;
                    }
                    let word = new Word(count, i, j, tempStr, p_rate, plus_rate, p_best);
                    result.push(word.getWord());
                }
            }
        }
        return result;
    }
    /**
     * 获取最佳左连接词
     * @param segment
     */
    getBestLAM(segmentArray) {
        for (let i = 0; i < segmentArray.length; i++) {
            // 没有最佳左连接词
            if (segmentArray[i].p_best === -1) {
                let p_begin_temp = segmentArray[i].p_begin;
                let best_word_temp = [];
                for (let j = 0; j < segmentArray.length; j++) {
                    // 在考虑范围内
                    if (p_begin_temp === segmentArray[j].p_end + 1) {
                        best_word_temp.push(j);
                    }
                }
                if (best_word_temp.length > 0) {
                    let p_max = 0;
                    for (let k = 1; k < best_word_temp.length; k++) {
                        if (segmentArray[best_word_temp[p_max]].plus_rate < segmentArray[best_word_temp[k]].plus_rate) {
                            p_max = k;
                        }
                    }
                    // 记录最佳左连接词及累积概率
                    segmentArray[i].p_best = best_word_temp[p_max];
                    segmentArray[i].plus_rate = segmentArray[i].p_rate * segmentArray[best_word_temp[p_max]].plus_rate;
                }
            }
        }
        return segmentArray;
    }
    // 获取最佳句尾词，并通过最佳左邻词，返回直到句头词。
    getresult(segmentArray, sentenceLength) {
        let end_word_temp = [];
        // 找到所有的结尾词
        for (let i = 0; i < segmentArray.length; i++) {
            if (sentenceLength == segmentArray[i].p_end) {
                end_word_temp.push(i);
            }
        }
        // 找出最佳结尾词
        let bestEndWord = 0;
        for (let i = 1; i < end_word_temp.length; i++) {
            if (segmentArray[end_word_temp[i]].plus_rate > segmentArray[end_word_temp[bestEndWord]].plus_rate) {
                bestEndWord = i;
            }
        }
        let position = end_word_temp[bestEndWord];
        // 存放分词结果
        let segmentResult = [];
        while ((segmentArray[position]).p_begin != 0) {
            segmentResult.push(segmentArray[position].p_word);
            position = segmentArray[position].p_best;
        }
        segmentResult.push(segmentArray[position].p_word);
        let result = "";
        for (let i = segmentResult.length - 1; i >= 0; i--) {
            result += segmentResult[i] + " ";
        }
        return result;
    }
}
exports.Segment = Segment;
