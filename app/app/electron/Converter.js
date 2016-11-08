const path = require('path')
const promiseSpawn = require('child-process-promise').spawn

const inherits = require('util').inherits
const EE = require('events').EventEmitter

const processer = require('./processer.js')

const Converter = function () {
  const self = this;
  if (!(this instanceof Converter)) {
      return new Converter()
  }
  EE.call(this)

  self.getMediaDuration = function (mediaPath) {
    return processer.getDuration(mediaPath)
  }

  self.convert = function (notificator, convertObject) {
    let workflow

    if (convertObject.pics.length > 1) {
      workflow = [processer.encodeVideo, processer.transition, processer.merge, processer.convert]
    } else {
      workflow = [processer.encodeVideo, processer.convert]
    }

    workflow.reduce((prev, next) => {
      return prev.then(next)
    }, Promise.resolve({
      notificator,
      meta: convertObject,
      image: convertObject.pics,
      audio: [convertObject.media],
      output: convertObject.output
    }))
    .then(res => {
      notificator.send('job-done')
    })
    .catch(err => {
      notificator.send('job-fail')
      console.log(err)
    })
  }
}
inherits(Converter, EE)

module.exports = Converter