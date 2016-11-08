<template>
<div class="fill-parent-height layout layout-column main-space watermark">
  <main class="flex layout layout-column content">
    <h3>输出</h3>
    <div class="flex layout layout-column">
      <p>
        <input type="checkbox" id="has-transition" v-model="output.transition" disabled>
        <label for="has-transition">添加图片渐变切换效果</label>
      </p>
      <p>
        <input type="checkbox" id="output-name" v-model="useDefaultName">
        <label for="output-name">默认文件名</label>
      </p>
      <p></p>
      <div class="input-field">
        <input :class="{'teal-text':!useDefaultName,'text-lighten-1':useDefaultName}" :disabled="useDefaultName" type="text" v-model="output.name">
        <label :class="{'active':true,'teal-text':!useDefaultName,'text-lighten-1':useDefaultName}">自定义文件名</label>
      </div>
      <p>
        <input type="checkbox" id="same-folder" v-model="sameFoleder">
        <label for="same-folder">输出在视频 / 音频同目录</label>
      </p>
      <p></p>
      <div class="input-field">
        <input :class="{'teal-text':!sameFoleder,'text-lighten-1':sameFoleder}" type="text" readonly="readonly" v-model="output.path" @click="onPathClick">
        <label :class="{'active':true,'teal-text':!sameFoleder,'text-lighten-1':sameFoleder}">输出目录</label>
      </div>
    </div>
  </main>
  <footer class="layout blue-grey lighten-4">
    <div class="layout layout-row main-space content">
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="prev">上一步</button>
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="convert">压制</button>
    </div>
  </footer>
</div>
</template>

<script>
const path = require('path')

export default {
  name: 'OutputTab',

  props: {
    store: Object
  },

  data () {
    return {
      sameFoleder: true,
      useDefaultName: true
    }
  },

  computed: {
    media () {
      return this.store.media
    },
    output () {
      return this.store.output
    }
  },

  watch: {
    sameFoleder (value) {
      if (value) {
        this.output.path = path.dirname(this.media.path)
      }
    },

    useDefaultName (value) {
      if (value) {
        this.output.name = this.output.defaultName
      }
    }
  },

  methods: {
    prev () {
      this.$dispatch('navigate', 'pics')
    },

    convert () {
      this.$dispatch('navigate', 'result')
      this.$dispatch('convert')
    },

    onPathClick
  }
}

function onPathClick () {
  if (!this.sameFoleder) {
    let folderPath = this.$electron.remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    this.output.path = folderPath || this.output.path
  }
}
</script>

<style lang="stylus" scoped>
.watermark::before
  mask-image url(../image/output.svg)

.content
  width 90%
  margin auto

main
  height 100%

footer
  height 70px

[type="checkbox"]
  +label
    font-size 1.5rem
    &::before
      top 50%
      transform translateY(-50%)

[type="checkbox"]:checked+label
  color #212121
  &::before
    top -3px
    transform rotate(40deg)

.input-field
  input
    font-size 1.5rem
  label
    font-size 1.2rem
  input[readonly]
    cursor pointer
</style>