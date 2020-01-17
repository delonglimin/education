module.exports = {
    configureWebpack:{
    },
    chainWebpack: config => {
      // 移除 prefetch 插件
      config.plugins.delete('prefetch')
    },
    publicPath: './',
}