<template>
<div class="ui-slide-tab">
  <div class="slide-tab-content layout" :style="contentDynamicStyle">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  name: 'UiSlideTab',

  props: {
    index: {
      type: Number,
      default: 1
    }
  },

  data () {
    return {
      tabs: []
    }
  },

  computed: {
    contentDynamicStyle () {
      return {
        width: this.tabs.length * 100 + '%',
        transform: 'translateX(-' + (this.index - 1) * parseInt(this.$el.clientWidth) + 'px)'
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.ui-slide-tab
  width 100%
  overflow hidden

.slide-tab-content
  height 100%
  transition all ease-in-out .5s
</style>