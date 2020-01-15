/*
 * @Author: Yonyou
 * @Date: 2020-01-15 09:20:40
 * @LastEditTime : 2020-01-15 13:47:19
 * @LastEditors  : hanfengmi
 * @Description: 
 */
// webpack.prod.js
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = merge(common, { // 将webpack.common.js合并到当前文件
    plugins: [
        new BundleAnalyzerPlugin() // 分析打包文件
    ]
})