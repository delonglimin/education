import Vue from 'vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './plugins/axios'
import App from './App.vue'
import store from './store'
import router from './router'
import './plugins/element.js'
import * as filters from './filters'

Vue.config.productionTip = false
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
