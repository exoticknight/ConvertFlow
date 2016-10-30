<template>
<div class="fill-parent-height layout layout-column main-space watermark">
  <main class="flex layout layout-column content">
    <h3>进度</h3>
    <div class="flex">
      <div v-if="encodeVideo.in" class="process layout cross-center">
        <i v-show="encodeVideo.status===1" class="material-icons small green-text text-darken-1">done</i>
        <i v-show="encodeVideo.status===-1" class="material-icons small red-text text-darken-1">close</i>
        <div v-show="encodeVideo.status===0" class="layout cross-center">
          <div class="preloader-wrapper tiny active">
            <div class="spinner-layer spinner-yellow-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div><div class="gap-patch">
                <div class="circle"></div>
              </div><div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
        <h5>处理视频<span v-show="encodeVideo.status===0"> {{ encodeVideo.progress }}%</span></h5>
      </div>
      <div v-if="transition.in" class="process layout cross-center">
        <i v-show="transition.status===1" class="material-icons small green-text text-darken-1">done</i>
        <i v-show="transition.status===-1" class="material-icons small red-text text-darken-1">close</i>
        <div v-show="transition.status===0" class="layout cross-center">
          <div class="preloader-wrapper tiny active">
            <div class="spinner-layer spinner-yellow-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div><div class="gap-patch">
                <div class="circle"></div>
              </div><div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
        <h5>添加过渡效果</h5>
      </div>
      <div v-if="merge.in" class="process layout cross-center">
        <i v-show="merge.status===1" class="material-icons small green-text text-darken-1">done</i>
        <i v-show="merge.status===-1" class="material-icons small red-text text-darken-1">close</i>
        <div v-show="merge.status===0" class="layout cross-center">
          <div class="preloader-wrapper tiny active">
            <div class="spinner-layer spinner-yellow-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div><div class="gap-patch">
                <div class="circle"></div>
              </div><div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
        <h5>合并</h5>
      </div>
      <div v-if="convert.in" class="process layout cross-center">
        <i v-show="convert.status===1" class="material-icons small green-text text-darken-1">done</i>
        <i v-show="convert.status===-1" class="material-icons small red-text text-darken-1">close</i>
        <div v-show="convert.status===0" class="layout cross-center">
          <div class="preloader-wrapper tiny active">
            <div class="spinner-layer spinner-yellow-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div><div class="gap-patch">
                <div class="circle"></div>
              </div><div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
        <h5>压制</h5>
      </div>
    </div>
  </main>
  <footer class="layout blue-grey lighten-4">
    <div class="layout layout-row main-space content">
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="more" :disabled="!end">再来</button>
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="console">详细输出</button>
    </div>
  </footer>
</div>
</template>

<script>
export default {
  name: 'ResultTab',

  props: {
    store: Object
  },

  data () {
    return initialState()
  },

  ready () {
    this.registerListeners()
  },

  methods: {
    more () {
      this.$data = initialState()
      this.$dispatch('reset')
      this.$dispatch('navigate', 'media')
    },

    console () {
      this.$dispatch('navigate', 'console')
    },

    registerListeners
  }
}

function registerListeners () {
  let process = 'encodeVideo preConvert transition convert merge'.split(' ')
  process.forEach(el => {
    this.$electron.ipcRenderer.on(el + ':in', () => {
      this[el].in = true
      this[el].status = 0
    })
    this.$electron.ipcRenderer.on(el + ':done', () => {
      this[el].status = 1
    })
    this.$electron.ipcRenderer.on(el + ':fail', () => {
      this[el].status = -1
    })
    this.$electron.ipcRenderer.on(el + ':progress', (_, p) => {
      this[el].progress = Math.floor(+p)
    })
  })

  this.$electron.ipcRenderer.on('job-done', () => {
    this.end = true
    let n = new Notification(this.store.output.name + ' 压制完成')
    n
  })
}

function initialState () {
  return {
    encodeVideo: {
      in: false,
      status: 0,
      progress: 0
    },
    transition: {
      in: false,
      status: 0
    },
    convert: {
      in: false,
      status: 0
    },
    merge: {
      in: false,
      status: 0
    },
    end: false
  }
}
</script>

<style lang="stylus" scoped>
.watermark::before
  mask-image url(../image/result.svg)

.content
  width 90%
  margin auto

main
  height 100%

footer
  height 70px

.process
  line-height 1.5em
  font-size 1.5rem
  .icon-wait
    width 28px
    height @width
    padding-left 3px
  h5
    margin-left .3em

.preloader-wrapper.tiny
  width 1em
  height 1em
  margin 0 3px
</style>