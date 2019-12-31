const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const cleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
let env = process.env.NODE_ENV == "development" ? "development" : "production";
module.exports = {
  entry: './src/index.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 定义输出目录
    filename: '[name]-[chunkhash].bundle.js'  // 定义输出文件名称
  },
  devServer: {
    // 设置基本目录结构
    contentBase: path.join(__dirname, "dist"),
    // 服务器的ip地址，也可以使用localhost
    host: "localhost",
    // 服务端压缩是否开启
    compress: true,
    // 配置服务端口号
    port: 8088
  },
  
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html',//根据自己的指定的模板文件来生成特定的 html 文件。这里的模板类型可以是任意你喜欢的模板，可以是 html, jade, ejs, hbs, 等等，但是要注意的是，使用自定义的模板文件时，需要提前安装对应的 loader， 否则webpack不能正确解析
        filename: 'index.html',// 默认情况下生成的 html 文件叫 index.html
        minify: {
          collapseWhitespace: true, //把生成的 index.html 文件的内容的没用空格去掉，减少空间
        },
        hash: true, //为了更好的 cache，可以在文件名后加个 hash。
    }),
    new ExtractTextPlugin({
      filename: "index.css",
    }),
    // new cleanWebpackPlugin(['dist']) //清理dist文件夹
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
        test: /\.(htm|html)$/i,
        use: ["html-withimg-loader"]
      },
      // less loader
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "less-loader"]
        }),
      },
    ]
  },
};