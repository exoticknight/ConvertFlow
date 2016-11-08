<template>
<div class="ui-timeline layout cross-center">
  <div class="ui-timeline-content layout cross-center">
    <span class="ui-timeline-starttime">{{ formattedStartTime }}</span>
    <div class="ui-timeline-track-wrap flex layout cross-center">
      <div class="ui-timeline-containment" v-el:containment></div>
      <div class="ui-timeline-track blue-grey lighten-4" @dblclick="createThumb($event)" v-el:track></div>
      <template v-if="key===''">
        <div
          v-for="thumb in timePoints"
          v-timethumb
          :start-value="thumb / actualRange"
          class="ui-timeline-thumb light-blue">
          <div class="ui-timeline-delete red" @click.prevent="deleteThumb($index)"><i class="material-icons tiny white-text">close</i></div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="thumb in timePoints"
          v-timethumb
          :start-value="thumb[key] / actualRange"
          class="ui-timeline-thumb light-blue">
          <div class="ui-timeline-delete red" @click.prevent="deleteThumb($index)"><i class="material-icons tiny white-text">close</i></div>
        </div>
      </template>
    </div>
    <span class="ui-timeline-endtime">{{ formattedEndTime }}</span>
  </div>
</div>
</template>

<script>
import Draggabilly from 'draggabilly'

import {
  formatDurationSecond,
  leftpad
} from '../../utils.js'

export default {
  name: 'UiTimeline',

  props: {
    timePoints: {
      type: Array,
      required: true,
      'default': []
    },
    key: {
      type: String,
      'default': ''
    },
    from: {
      type: Number,
      'default': 0
    },
    to: {
      type: Number,
      'default': 100
    }
  },

  directives: {
    timethumb: {
      params: ['startValue'],
      bind () {
        this.vm.$nextTick(() => {
          this.el.style.left = this.params.startValue * 100 + '%'
          this.draggable = new Draggabilly(this.el, {
            containment: this.vm.$els.containment,
            axis: 'x'
          })
          this.draggable.on('dragMove', () => {
            this.vm.$emit('dragMove', this.draggable.position.x)
          })
          this.draggable.on('dragStart', () => {
            this.vm.$emit('dragStart', this.draggable.position.x)
          })
          this.draggable.on('dragEnd', () => {
            this.vm.$emit('dragEnd', this.draggable.position.x)
          })
        })
      },
      unbind () {
        this.draggable.destroy()
      }
    }
  },

  data () {
    return {
      visualRange: 0,
      dragging: false,
      trackClientX: 0
    }
  },

  computed: {
    actualRange () {
      return this.to - this.from
    },

    formattedStartTime () {
      let o = formatDurationSecond(this.from)
      return [
        leftpad(o.hour, 2, '0'),
        leftpad(o.minute, 2, '0'),
        leftpad(o.second, 2, '0')
      ].join(':')
    },

    formattedEndTime () {
      let o = formatDurationSecond(this.to)
      return [
        leftpad(o.hour, 2, '0'),
        leftpad(o.minute, 2, '0'),
        leftpad(o.second, 2, '0')
      ].join(':')
    }
  },

  events: {
    dragMove (offsetX) {
      this.$dispatch('pointmove', offsetX / this.$els.track.getBoundingClientRect().width * this.actualRange)
    },

    dragStart (offsetX) {
      this.$dispatch('pointwillmove', offsetX / this.$els.track.getBoundingClientRect().width * this.actualRange)
    },

    dragend (offsetX) {
      this.$dispatch('pointdidmove', offsetX / this.$els.track.getBoundingClientRect().width * this.actualRange)
    }
  },

  methods: {
    createThumb,
    deleteThumb
  }
}

function createThumb ($event) {
  let point = ($event.clientX - this.$els.track.getBoundingClientRect().left) / this.$els.track.getBoundingClientRect().width * this.actualRange
  this.$dispatch('pointadd', point)
}

function deleteThumb ($index) {
  this.$dispatch('pointdelete', $index)
}
</script>

<style lang="stylus" scoped>
$TRACK_HEIGHT = 4px
$THUMB_HEIGHT = 16px

.ui-timeline
  position relative
  height 100%

.ui-timeline-content
  width 100%
  margin auto 0
  .ui-timeline-track-wrap
    position relative
    .ui-timeline-containment
      position absolute
      left 0
      right 0
      margin-left -($THUMB_HEIGHT / 2)
      margin-right -($THUMB_HEIGHT / 2)
    .ui-timeline-track
      position absolute
      width 100%
      height $TRACK_HEIGHT
      cursor pointer
    .ui-timeline-thumb
      z-index 1
      position absolute
      width $THUMB_HEIGHT
      height $THUMB_HEIGHT
      margin-left -($THUMB_HEIGHT / 2)
      border-radius 50%
      cursor ew-resize
      &:hover
        .ui-timeline-delete
          opacity 1
          visibility visible
          transform translateY(-130%) translateX(-50%)
      .ui-timeline-delete
        opacity 0
        visibility hidden
        transition all ease-in-out .1s
        position absolute
        left 50%
        transform translateY(-160%) translateX(-50%)
        width 1.4rem
        height 1.4rem
        padding .1rem
        text-align center
        border-radius 2px
        cursor pointer
        i
          cursor pointer
        &:hover
          display block
        &::before
          content ''
          width 0
          height 0
          border-style solid
          border-width 10px 5px 0 5px
          border-color #F44336 transparent transparent transparent
          position absolute
          top 100%
          left 50%
          transform translateX(-50%)
  .ui-timeline-starttime
    margin-right ($THUMB_HEIGHT / 2) + 2px
  .ui-timeline-endtime
    margin-left ($THUMB_HEIGHT / 2) + 2px
</style>