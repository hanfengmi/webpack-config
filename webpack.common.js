/*
 * @Author: Yonyou
 * @Date: 2020-01-03 11:40:40
 * @LastEditTime : 2020-01-16 14:34:21
 * @LastEditors  : hanfengmi
 * @Description: 
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");


let env = process.env.NODE_ENV == "development" ? "development" : "production";
module.exports = {
  entry: path.resolve(__dirname,'src/index.js'), // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 定义输出目录
    filename: '[name]-[chunkhash].bundle.js',  // 定义输出文件名称
    chunkFilename: "[name].[chunkhash].chunk.js",
  },
  
  plugins: [
    new MiniCssExtractPlugin({
  　　filename: "[name].[chunkhash:8].css",
  　　chunkFilename: "[id].css"
　　}),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),// 压缩moment,删除语言包
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns:["**/*","!lib","!lib/**"]
    }), //清理dist文件夹
    new webpack.BannerPlugin('版权所有，蜂蜜所有，翻版必究'),
    new HtmlWebpackPlugin({
        template: './src/index.html',// 根据自己的指定的模板文件来生成特定的 html 文件。这里的模板类型可以是任意你喜欢的模板，可以是 html, jade, ejs, hbs, 等等，但是要注意的是，使用自定义的模板文件时，需要提前安装对应的 loader， 否则webpack不能正确解析
        filename: 'index.html',// 默认情况下生成的 html 文件叫 index.html
        minify: {
          collapseWhitespace: true, //把生成的 index.html 文件的内容的没用空格去掉，减少空间
        },
        hash: true, //为了更好的 cache，可以在文件名后加个 hash。
    }),
    new ExtractTextPlugin({
      filename: "index.css",
    }),
    
  ],
  module: {
    rules:[
      // css loader
      {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader", 
            
            use: ["css-loader", "postcss-loader"]
        })  // 这里顺序不能颠倒
      },
      // 图片 loader
      {
        test: /\.(png|jpg|gif|jpeg)/,
        use: [{
            loader: 'url-loader',
            options: {
              limit: 500,   //是把小于500B的文件打成Base64的格式，写入JS
              outputPath: 'images/',  //打包后的图片放到images文件夹下
              esModule: false // file-load问题，与html-withimg-loader冲突
           }
        }]
      },
      {
        test: /\.(eot|woff2?|ttf|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name]-[hash:5].min.[ext]",
              limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
              outputPath: "fonts/"
            }
          }
        ]
      },
      {
        test: /\.(htm|html)$/i,
        use: ["html-withimg-loader"]
      },
      // less loader
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader", "postcss-loader"]
        }),
      },
      // 转义ES6
      {                             // jsx配置
        test: /(\.jsx|\.js)$/,   
        use: {                    // 注意use选择如果有多项配置，可写成这种对象形式
            loader: "babel-loader",
            options: {
                presets: [
                    "env", "react"
                ]
            }
        },
        exclude: /node_modules/
      }
    ]
  },
};