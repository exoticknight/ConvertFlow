<template>
<div class="ui-window-title-bar layout layout-row main-space cross-center">
  <div class="ui-window-title flex fill-parent-height layout cross-center">
    <span>{{ name }}</span>
  </div>
  <div class="ui-window-control fill-parent-height layout layout-row">
    <div class="ui-window-control-button minimize" @click="minimize">
      <i class="material-icons tiny">remove</i>
    </div>
    <div class="ui-window-control-button close" @click="close">
      <i class="material-icons tiny">close</i>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'UiTitleBar',

  props: {
    name: {
      type: String,
      'default': 'Title'
    }
  },

  methods: {
    minimize () {
      this.$electron.ipcRenderer.sendSync('app-minimize')
    },
    close () {
      this.$electron.ipcRenderer.sendSync('app-quit')
    }
  }
}
</script>

<style lang="stylus" scoped>
.ui-window-title-bar
  font-weight lighter
  color #212121
  .ui-window-title
    -webkit-app-region drag
    padding-left .7em
    span
      font-size 1.2em
</style>