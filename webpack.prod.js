// webpack.prod.js
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = merge(common, { // 将webpack.common.js合并到当前文件
    plugins: [
        new CleanWebpackPlugin(), //清理dist文件夹
        new BundleAnalyzerPlugin() // 分析打包文件
    ]
})