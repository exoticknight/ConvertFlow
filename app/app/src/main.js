import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'

Vue.use(Electron)
Vue.use(Resource)

Vue.config.debug = true

import App from './App'

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
})
