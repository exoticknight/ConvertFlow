<template>
<div class="fill-parent-height layout layout-column main-space watermark">
  <main class="flex layout layout-column content">
    <h3>图片</h3>
    <div class="flex layout layout-column">
      <div class="flex layout layout-row main-space" style="max-height:100%">
        <div v-show="pics.length" class="col5" style="max-height:inherit">
          <div class="row">
            <div class="col s4"><h5>{{ picTimeInfo.hour }} 时</h5></div>
            <div class="col s4"><h5>{{ picTimeInfo.minute }} 分</h5></div>
            <div class="col s4"><h5>{{ picTimeInfo.second }} 秒</h5></div>
          </div>
          <div class="row">
            <div class="col s11"><h5 style="text-align:justify" class="ellipsis">{{ curPic.path }}</h5></div>
          </div>
        </div>
        <div v-show="pics.length" class="col7 layout">
          <div
            :class="{'flex':true,'holder':true,'layout':true,'main-center':true,'cross-center':true,'is-hover':isDragover,'has-value':curPic.path}"
            @drop.prevent="onDrop"
            @dragover.prevent="isDragover=true"
            @dragleave.prevent="isDragover=false">
            <span v-show="!curPic.path">{{ curPic.path || '点击或拖入图片' }}</span>
            <img
              v-show="curPic.path"
              v-el:image
              :src="curPic.cache"
              class="image">
            <input type="file" class="input-file" accept=".jpeg,.jpg,.bmp" @change="onFileUploadChange">
          </div>
        </div>
        <div v-show="!pics.length" class="col12 layout layout-column main-end cross-center">
          <h4>双击时间轴添加图片</h4>
          <i class="material-icons medium">arrow_downward</i>
        </div>
      </div>
    </div>
    <div style="height:70px">
      <ui-timeline
        :time-points="pics"
        :key="'startSecond'"
        :to="media.duration"
        @pointadd="addTimePoint"
        @pointwillmove="selectPoint"
        @pointmove="onPointMove"
        @pointdelete="onPointDelete"
        @pointdidmove="selectPoint"></ui-timeline>
    </div>
  </main>
  <footer class="layout blue-grey lighten-4">
    <div class="layout layout-row main-space content">
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="prev">上一步</button>
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="next" :disabled="nextBtnDisabled">下一步</button>
    </div>
  </footer>
</div>
</template>

<script>
import UiTimeline from './UIComponents/UiTimeline.vue'

import {
  checkFileType,
  formatDurationSecond
} from '../utils.js'

export default {
  name: 'PicsTab',

  components: {
    UiTimeline
  },

  props: {
    store: Object
  },

  data () {
    return {
      curPic: {
        path: '',
        width: 0,
        height: 0,
        cache: null,
        startSecond: 0
      },

      isDragover: false
    }
  },

  computed: {
    pics () {
      return this.store.pics
    },

    media () {
      return this.store.media
    },

    nextBtnDisabled () {
      return !this.pics.some(e => !!e.path)
    },

    picTimeInfo () {
      return formatDurationSecond(this.curPic.startSecond)
    }
  },

  watch: {
    pics () {
      if (!this.pics.length) {
        this.curPic = {
          path: '',
          width: 0,
          height: 0,
          cache: null,
          startSecond: 0
        }
      }
    }
  },

  methods: {
    prev () {
      this.$dispatch('navigate', 'media')
    },

    next () {
      this.$dispatch('navigate', 'output')
    },

    onDrop (e) {
      let filePath = e.dataTransfer.files[0].path
      this.isDragover = false
      if (checkFileType(filePath, ['jpeg', 'jpg', 'bmp'])) {
        this.curPic.path = filePath
        this.loadLocalImage(e.dataTransfer.files[0])
      }
    },

    onFileUploadChange (e) {
      if (e.srcElement.files[0]) {
        this.curPic.path = e.srcElement.files[0].path
        this.loadLocalImage(e.srcElement.files[0])
      }
    },

    loadLocalImage,

    addTimePoint,
    selectPoint,
    onPointMove,
    onPointDelete
  }
}

function loadLocalImage (file) {
  const reader = new FileReader()
  const image = this.$els.image
  const self = this

  reader.onload = function (e) {
    self.curPic.cache = image.src = e.target.result
    self.curPic.width = image.naturalWidth
    self.curPic.height = image.naturalHeight
  }

  reader.readAsDataURL(file)
}

function addTimePoint (point) {
  this.curPic = {
    path: '',
    width: 0,
    height: 0,
    cache: null,
    startSecond: point
  }
  this.pics.push(this.curPic)
}

function selectPoint (pointValue) {
  let point = this.pics.find(el => el.startSecond === pointValue)
  if (point) {
    this.curPic = point
  }
}

function onPointMove (value) {
  this.curPic.startSecond = value
}

function onPointDelete (index) {
  if (this.curPic === this.pics[index]) {
    this.curPic = {
      path: '',
      width: 0,
      height: 0,
      cache: null,
      startSecond: 0
    }
  }
  this.pics.$remove(this.pics[index])
}
</script>

<style lang="stylus" scoped>

.watermark::before
  mask-image url(../image/pics.svg)

.content
  width 90%
  margin auto

main
  height 100%

footer
  height 70px

.holder
  .image
    position absolute
    left 50%
    top 50%
    transform translate(-50%, -50%)
    width auto
    height auto
    max-width 100%
    max-height 100%
</style>