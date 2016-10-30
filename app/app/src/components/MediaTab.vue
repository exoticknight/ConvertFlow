<template>
<div class="fill-parent-height layout layout-column main-space watermark">
  <main class="flex layout layout-column content">
    <h3>视频 / 音频</h3>
    <div class="flex layout layout-column">
      <div
        :class="{'flex':true,'holder':true,'layout':true,'main-center':true,'cross-center':true,'is-hover':isDragover,'has-value':media.path}"
        @drop.prevent="onDrop"
        @dragover.prevent="isDragover=true"
        @dragleave.prevent="isDragover=false">
        <span class="ellipsis">{{ media.path ? media.path : '点击或拖入视频 / 音频' }}</span>
        <input v-el:fileinput value="" type="file" class="input-file" accept=".mp4,.mp3,.wav,.aac" @change="onFileUploadChange">
      </div>
      <h6>&nbsp;</h6>
    </div>
  </main>
  <footer class="layout blue-grey lighten-4">
    <div class="layout layout-row main-end content">
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="next" :disabled="!media.path">下一步</button>
    </div>
  </footer>
</div>
</template>

<script>
const path = require('path')
import {checkFileType} from '../utils.js'

export default {
  name: 'MediaTab',

  props: {
    store: Object
  },

  data () {
    return {
      isDragover: false
    }
  },

  computed: {
    media () {
      return this.store.media
    },

    pics () {
      return this.store.pics
    },

    output () {
      return this.store.output
    }
  },

  watch: {
    'media.path' (newVal) {
      if (!newVal) {
        this.$els.fileinput.value = ''
      }
    }
  },

  methods: {
    next () {
      if (!this.media.duration) {
        this.getMediaDuration()
        this.resetTimeline()
      }
      this.$dispatch('navigate', 'pics')
    },

    onDrop (e) {
      let filePath = e.dataTransfer.files[0].path
      this.isDragover = false
      if (checkFileType(filePath, ['mp4', 'mp3', 'wav', 'aac'])) {
        this.media.path = filePath
        this.media.duration = 0
        this.output.name = this.output.defaultName = path.win32.basename(filePath, path.win32.extname(filePath)) + '_out'
        this.output.path = path.dirname(this.media.path)
      }
    },

    onFileUploadChange (e) {
      console.log(e)
      if (e.srcElement.files[0]) {
        this.media.path = e.srcElement.files[0].path
        this.media.duration = 0
        this.output.name = this.output.defaultName = path.win32.basename(this.media.path, path.win32.extname(this.media.path)) + '_out'
        this.output.path = path.dirname(this.media.path)
      }
    },

    getMediaDuration,
    resetTimeline
  }
}

function getMediaDuration () {
  this.media.duration = Math.round(+this.$electron.ipcRenderer.sendSync('get-media-duration', this.media.path))
}

function resetTimeline () {
  this.store.pics = []
}
</script>

<style lang="stylus" scoped>
.watermark::before
  mask-image url(../image/media.svg)

.content
  width 90%
  margin auto

main
  height 100%

footer
  height 70px
</style>