// webpack.dev.js
const path = require('path');
const merge = require('webpack-merge');  // 引入webpack-merge功能模块
const common = require('./webpack.common.js'); // 引入webpack.common.js

module.exports = merge(common, {   // 将webpack.common.js合并到当前文件
    devServer: {
        // 设置基本目录结构
        contentBase: path.join(__dirname, "./dist"),
        // 服务器的ip地址，也可以使用localhost
        host: "localhost",
        // 服务端压缩是否开启
        compress: true,
        // 配置服务端口号
        port: 8088
    },
})