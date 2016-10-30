<template>
<div class="ui-tab">
  <slot></slot>
</div>
</template>

<script>
export default {
  name: 'UiTab',

  created () {
    this.$parent.tabs.push(this)
  },

  beforeDestroy () {
    this.$parent.tabs.$remove(this)
  }
}
</script>

<style lang="stylus" scoped>
.ui-tab
  width 100%
  overflow hidden
</style>