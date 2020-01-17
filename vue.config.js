module.exports = {
  configureWebpack: {
    mode: 'development',
    optimization: {
      
    }
  },
  chainWebpack: config => {
    // 移除 prefetch 插件
    config.plugins.delete("prefetch")
  },
  css: {
    sourceMap: false,
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/assets/variable.scss";
        `
      }
    }
  },
  publicPath: "./"
}
