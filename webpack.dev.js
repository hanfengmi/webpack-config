/*
 * @Author: Yonyou
 * @Date: 2020-01-15 09:20:40
 * @LastEditTime: 2020-01-15 14:32:38
 * @LastEditors: hanfengmi
 * @Description: 
 */
// webpack.dev.js
const path = require('path');
const merge = require('webpack-merge');  // 引入webpack-merge功能模块
const common = require('./webpack.common.js'); // 引入webpack.common.js

module.exports = merge(common, {   // 将webpack.common.js合并到当前文件
    devServer: {
        contentBase: path.join(__dirname, "./dist"), // 设置基本目录结构
        host: "localhost", // 服务器的ip地址，也可以使用localhost
        compress: true, // 服务端压缩是否开启
        port: 8088 // 配置服务端口号
    },
})