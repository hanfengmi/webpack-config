module.exports = { 
  // parser: 'postcss-strip-inline-comments',
  parser: 'postcss-scss',
  plugins: [
    require('autoprefixer')({overrideBrowserslist: ['> 0.15% in CN',"Firefox ESR"]})
  ]
}