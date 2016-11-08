<template>
<div class="ui-window layout layout-column flex card grey-text text-darken-4">
  <ui-title-bar :name="'转流'"></ui-title-bar>
  <div class="ui-window-content flex layout layout-row">
    <ui-slide-tab :index="tabIndex">
      <ui-tab>
        <media-tab
          :store.sync="store"
          @navigate="navigateToTab"></media-tab>
      </ui-tab>
      <ui-tab>
        <pics-tab
          :store.sync="store"
          @navigate="navigateToTab"></pics-tab>
      </ui-tab>
      <ui-tab>
        <output-tab
          :store.sync="store"
          @navigate="navigateToTab"
          @convert="convert"></output-tab>
      </ui-tab>
      <ui-tab>
        <result-tab
          :store="store"
          @navigate="navigateToTab"
          @reset="reset"></result-tab>
      </ui-tab>
      <ui-tab>
        <about-tab
          @navigate="navigateToTab"></about-tab>
      </ui-tab>
    </ui-slide-tab>
  </div>
</div>
</template>

<script>
import './style/materialize.min.css'

import UiTitleBar from './components/UIComponents/UiTitleBar.vue'
import UiSlideTab from './components/UIComponents/UiSlideTab.vue'
import UiTab from './components/UIComponents/UiTab.vue'

import MediaTab from './components/MediaTab.vue'
import PicsTab from './components/PicsTab.vue'
import OutputTab from './components/OutputTab.vue'
import ResultTab from './components/ResultTab.vue'
import AboutTab from './components/AboutTab.vue'

const TABS = ['media', 'pics', 'output', 'result', 'about']

export default {
  components: {
    UiTitleBar,
    UiSlideTab,
    UiTab,
    MediaTab,
    PicsTab,
    OutputTab,
    ResultTab,
    AboutTab
  },

  data () {
    return {
      step: 'media',  // media | pics | output | result | about

      store: {
        media: {
          path: '',
          duration: 0
        },
        pics: [],
        output: {
          transition: true,
          defaultName: '',
          name: '',
          path: ''
        }
      }
    }
  },

  computed: {
    tabIndex () {
      return TABS.indexOf(this.step)
    }
  },

  methods: {
    navigateToTab (tab) {
      this.step = tab
    },

    convert () {
      const seen = new Map()
      let pics = this.store.pics
        .filter(p => p.path)
        .map(e => { return { path: e.path, width: e.width, height: e.height, startSecond: Math.floor(e.startSecond) } })  // deep copy
        .filter(p => !seen.has(p.startSecond) && seen.set(p.startSecond, 1))  // deduplicate
        .sort((a, b) => a.startSecond - b.startSecond)

      if (!pics.find(e => e.startSecond === 0)) {
        pics.unshift({
          path: '',
          width: 0,
          height: 0,
          startSecond: 0
        })
      }

      const convertObject = {
        media: {
          path: this.store.media.path,
          duration: this.store.media.duration
        },
        output: {
          transition: this.store.output.transition,
          defaultName: this.store.output.defaultName,
          name: this.store.output.name,
          path: this.store.output.path
        },
        pics
      }
      // console.log(convertObject)
      // return
      this.$electron.ipcRenderer.send('convert', convertObject)
    },

    reset () {
      this.store.pics = []  // trigger unbind
      this.store = {
        media: {
          path: '',
          duration: 0
        },
        pics: [],
        output: {
          transition: true,
          defaultName: '',
          name: '',
          path: ''
        }
      }
    }
  },

  created () {
    document.addEventListener('dragover', function (event) {
      event.preventDefault()
      return false
    }, false)

    document.addEventListener('drop', function (event) {
      event.preventDefault()
      return false
    }, false)
  }
}
</script>

<style lang="stylus">
@import 'style/icon.styl'
@import 'style/reset.styl'
@import 'style/grid.styl'
@import 'style/ui.styl'
</style>