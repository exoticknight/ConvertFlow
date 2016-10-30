<template>
<div class="fill-parent-height layout layout-column main-space">
  <main class="flex layout layout-column content">
    <h3>详细输出</h3>
    <div class="flex"></div>
  </main>
  <footer class="layout blue-grey lighten-4">
    <div class="layout layout-row main-space content">
      <button class="waves-effect waves-light btn blue-grey darken-1" @click="back">返回</button>
    </div>
  </footer>
</div>
</template>

<script>
export default {
  name: 'ConsoleTab',

  methods: {
    back () {
      this.$dispatch('navigate', 'result')
    }
  }
}
</script>

<style lang="stylus" scoped>
.content
  width 90%
  margin auto

main
  height 100%

footer
  height 70px
</style>