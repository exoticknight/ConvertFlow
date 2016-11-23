<template>
<div class="fill-parent-height layout layout-column main-space watermark">
  <main class="flex layout layout-column content">
    <div class="flex layout layout-column">
      <h1>&nbsp;</h1>
      <div class="flex layout layout-column cross-center">
        <h1 style="font-size:6em;margin-bottom:0">ConvertFlow</h1>
        <h3 style="margin-top:0">转流</h3>
        <h4>by exoticknight</h4>
        <div class="flex layout layout-row main-center">
          <span class="info-line">
            <a href="javascript:;" @click.prevent="openUrl('http://blog.e10t.net')" title="blog"><img src="../image/rss-symbol.png" height="32" width="32" alt=""></a>
          </span>
          <span class="info-line">
            <a href="javascript:;" @click.prevent="openUrl('https://www.github.com/exoticknight')" title="exoticknight"><img src="../image/github-logo-1.png" height="32" width="32" alt=""></a>
          </span>
          <span class="info-line">
            <a href="javascript:;" @click.prevent="openUrl('https://twitter.com/ExoticknightD')" title="ExoticknightD"><img src="../image/twitter-logo.png" height="32" width="32" alt=""></a>
          </span>
        </div>
      </div>
    </div>
  </main>
  <footer class="layout blue-grey lighten-4">
    <div class="layout layout-row main-space content">
      <button class="waves-effect waves-light btn blue-grey darken-1" @click.prevent="back">返回</button>
    </div>
  </footer>
</div>
</template>

<script>
export default {
  name: 'AboutTab',

  methods: {
    back () {
      this.$dispatch('navigate', 'result')
    },

    openUrl (url) {
      this.$electron.shell.openExternal(url)
    }
  }
}
</script>

<style lang="stylus" scoped>
.watermark::before
  mask-image url(../image/about.svg)

.content
  width 90%
  margin auto

main
  height 100%

footer
  height 70px

.info-line
  margin 1em
  img
    line-height 110%
    margin 0.82rem 0 0.656rem 0
    filter drop-shadow(0 0 15px #141414)
    cursor pointer
    &:hover
      animation-name breath
      animation-duration 2s
      animation-timing-function ease-in-out
      animation-iteration-count infinite

@keyframes breath {
  from {
    opacity 1
    filter drop-shadow(0 0 15px #141414)
  }
  50% {
    opacity 0.7
    filter drop-shadow(0 0 10px #ccc)
  }
  to {
    opacity 1
    filter drop-shadow(0 0 15px #141414)
  }
}
</style>