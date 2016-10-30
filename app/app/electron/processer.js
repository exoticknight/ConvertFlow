const fs = require('fs')
const os = require('os')
const path = require('path')

const promiseSpawn = require('child-process-promise').spawn
// const Queue = require('promise-queue')
const PromiseQueue = require('promiseq')

const debounce = require('lodash.debounce')

const command = require('./command.js')

const MAX_CONCURRENT = 2
const MAX_QUEUE = Infinity

// from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/b6b6ef35d3c09d6dc71a23ceb1fc25bccb7acb1f/lib/utils.js#L20
function parseProgressLine(line) {
  var progress = {}

  // Remove all spaces after = and trim
  line  = line.replace(/=\s+/g, '=').trim()
  var progressParts = line.split(' ')

  // Split every progress part by "=" to get key and value
  for(var i = 0; i < progressParts.length; i++) {
    var progressSplit = progressParts[i].split('=', 2)
    var key = progressSplit[0]
    var value = progressSplit[1]

    // This is not a progress line
    if(typeof value === 'undefined')
      return null

    progress[key] = value
  }

  return progress
}

// from https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/b6b6ef35d3c09d6dc71a23ceb1fc25bccb7acb1f/lib/utils.js#L237
function timemarkToSeconds (timemark) {
  if (typeof timemark === 'number') {
    return timemark
  }

  if (timemark.indexOf(':') === -1 && timemark.indexOf('.') >= 0) {
    return Number(timemark)
  }

  var parts = timemark.split(':')

  // add seconds
  var secs = Number(parts.pop())

  if (parts.length) {
    // add minutes
    secs += Number(parts.pop()) * 60
  }

  if (parts.length) {
    // add hours
    secs += Number(parts.pop()) * 3600
  }

  return secs
}

function encodeImage2video ({duration, WH}, image, output, logFn) {
  return new Promise((res, rej) => {
    const cmd = command.image2video(duration, image, output, WH)
    const job = promiseSpawn(process.env.FFMPEG_PATH, cmd)
    job.childProcess.on('error', err => {
      console.log(err.message)
      rej(err)
    })
    job.childProcess.stderr.on('data', data => {
      let ret = parseProgressLine(data.toString())
      if (ret && ret.time) {
        logFn(timemarkToSeconds(ret.time) / duration)
      }
    })

    job
    .then(result => {
      res(output)
    })
    .catch(err => {
      rej(err)
    })
  })
}

function applyFade (input, output, isFadeIn, isFadeOut, outStart) {
  return new Promise((res, rej) => {
    let cmd
    if (isFadeIn && isFadeOut) {
      cmd = command.videoFadeInOut(input, output, outStart)
    } else if (isFadeIn) {
      cmd = command.videoFadeIn(input, output)
    } else if (isFadeOut) {
      cmd = command.videoFadeOut(input, output, outStart)
    }

    const job = promiseSpawn(process.env.FFMPEG_PATH, cmd)
    job.childProcess.on('error', err=> {
      console.log(err.message)
      rej(err)
    })

    job
    .then(() => {
      res(output)
    })
    .catch(err => {
      rej(err)
    })
  })
}

function mergeVideo (receiptFile, output) {
  return new Promise((res, rej) => {
    const cmd = command.mergeVideo(receiptFile, output)
    const job = promiseSpawn(process.env.FFMPEG_PATH, cmd)
    job.childProcess.on('error', err => {
      console.log(err.message)
      rej(err)
    })

    job
    .then(() => {
      res(output)
    })
    .catch(err => {
      rej(err)
    })
  })
}

function videoXaudio2video (video, audio, output) {
  return new Promise((res, rej) => {
    const cmd = command.videoCopyXaudioCopy2video(video, audio, output)
    const job = promiseSpawn(process.env.FFMPEG_PATH, cmd)
    job.childProcess.on('error', err => {
      console.log(err.message)
      rej(err)
    })

    job
    .then(() => {
      res(output)
    })
    .catch(err => {
      rej(err)
    })
  })
}

function imageXaudio2video ({duration, WH}, image, audio, outputPath, outputName, logFn) {
  let tmpFile = path.resolve(outputPath, outputName + '_tmp.mp4')
  let outputFile = path.resolve(outputPath, outputName + '.mp4')

  let worker = new Promise((res, rej) => {
    const cmd = command.image2video(duration, image, tmpFile, WH)
    const job = promiseSpawn(process.env.FFMPEG_PATH, cmd)
    job.childProcess.on('error', err => {
      console.log(err.message)
      rej(err)
    })
    job.childProcess.stderr.on('data', data => {
      let ret = parseProgressLine(data.toString())
      if (ret && ret.time) {
        logFn(timemarkToSeconds(ret.time) / duration)
      }
    })

    job
    .then(result => {
      res()
    })
    .catch(err => {
      rej(err)
    })
  })

  worker.then(() => {
    return new Promise((res, rej) => {
      const cmd = command.videoCopyXaudioCopy2video(tmpFile, audio, outputFile)
      const job = promiseSpawn(process.env.FFMPEG_PATH, cmd)
      job.childProcess.on('error', err => {
        console.log(err.message)
        rej(err)
      })

      job
      .then(() => {
        fs.unlinkSync(tmpFile)
        res(outputFile)
      })
      .catch(err => {
        rej(err)
      })
    })
  })

  return worker
}

exports.getDuration = function (mediaPath) {
  let sarg = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', '-i', mediaPath]
  return promiseSpawn(process.env.FFPROBE_PATH, sarg, {capture: [ 'stdout', 'stderr' ]})
    .then(result => {
      return result.stdout.toString()
    })
}

exports.directConvert = function ({notificator, meta, image, audio, output}) {
  const sendProgress = debounce(value => {
    notificator.send('convert:progress', value * 100)
  }, 1000, { 'maxWait': 2000 })

  notificator.send('convert:in')

  const job = imageXaudio2video({duration: meta.media.duration}, image[0].path, audio[0].path, output, meta.output.name, sendProgress)
  job
  .then(() => {
    sendProgress.cancel()
    notificator.send('convert:done')
    return {
      notificator,
      meta,
      image,
      audio,
      output
    }
  })
  .catch(err => {
    notificator.send('convert:fail')
    rej(err)
  })

  return job
}

exports.encodeVideo = function ({notificator, meta, image, audio, output}) {
  const tmpPath = os.tmpDir()
  const maskedName = new Buffer(meta.output.name).toString('base64').replace(/=/g, '_')

  const ratio = [Math.max(...image.map(e => e.width)), Math.max(...image.map(e => e.height))]
  // even resolution
  ratio[0] = ratio[0] % 2 ? ratio[0] + 1 : ratio[0]
  ratio[1] = ratio[1] % 2 ? ratio[1] + 1 : ratio[1]

 // prepare commands
  const videoParts = image.map((el, i) => {
    const videoFullPath = path.resolve(tmpPath, maskedName + '_' + i + '.mp4')
    return {
      image: el.path || process.env.BLACK_IMAGE_PATH,
      path: videoFullPath
    }
  })

  // calculate duration
  image.slice(1).forEach((el, i) => {
    videoParts[i].duration = el.startSecond - image[i].startSecond
  })
  videoParts[videoParts.length-1].duration = audio[0].duration - image[image.length-1].startSecond

  return new Promise((res, rej) => {
    notificator.send('encodeVideo:in')

    const queue = new PromiseQueue(MAX_CONCURRENT)
    const sendProgress = (() => {
      const valueCount = new Array(image.length).fill(0)
      return (value, i) => {
        valueCount[i] = value
        notificator.send('encodeVideo:progress', valueCount.reduce((a, b) => a + b, 0) / valueCount.length * 100)
      }
    })()

    videoParts.forEach((el, i) => {
      const progress = debounce(value => {
        sendProgress(value, i)
      }, 1000, { 'maxWait': 2000 })
      queue.push(() => {
        return encodeImage2video({duration:el.duration, WH:ratio}, el.image, el.path, progress)
      })
      .then(() => {
        progress.cancel()
      })
      .catch(err => {
        console.log(err.message)
        rej(err)
      })
    })

    queue
    .close()
    .then(() => {
      notificator.send('encodeVideo:done')
      res({
        notificator,
        meta,
        image: videoParts,
        audio,
        output
      })
    })
    .catch(err => {
      notificator.send('encodeVideo:fail')
      console.log(err.message)
      rej(err)
    })
  })
}

exports.merge = function ({notificator, meta, image, audio, output}) {
  const tmpPath = os.tmpDir()
  const outputPath = path.resolve(tmpPath, meta.output.name + '.video' + '.mp4')
  const receiptFile = path.resolve(tmpPath, 'receipt.video')

  return new Promise((res, rej) => {
    notificator.send('merge:in')

    fs.writeFileSync(receiptFile, image.map(e => 'file \'' + e + '\'').join('\n'))
    const job = mergeVideo(receiptFile, outputPath)
    job
    .then(() => {
      notificator.send('merge:done')
      fs.unlinkSync(receiptFile)
      res({
        notificator,
        meta,
        image: [{path: outputPath}],
        audio,
        output
      })
    })
    .catch(err => {
      notificator.send('merge:fail')
      rej(err)
    })
  })
}

exports.transition = function ({notificator, meta, image, audio, output}) {
  const tmpPath = os.tmpDir()

  const head2tail = image.slice(1, -1)
  const taskDes = head2tail.map(el => {
    const name = path.win32.basename(el.path, path.win32.extname(el.path))
    return {
      fadeIn: true,
      fadeOut: true,
      outLast: el.duration - 1,
      input: el.path,
      output: path.resolve(tmpPath, name + '_t' + '.mp4')
    }
  })
  taskDes.unshift({
    fadeIn: false,
    fadeOut: true,
    outLast: image[0].duration - 1,
    input: image[0].path,
    output: path.resolve(tmpPath, path.win32.basename(image[0].path, path.win32.extname(image[0].path)) + '_t' + '.mp4')
  })
  taskDes.push({
    fadeIn: true,
    fadeOut: false,
    input: image[image.length-1].path,
    output: path.resolve(tmpPath, path.win32.basename(image[image.length-1].path, path.win32.extname(image[image.length-1].path)) + '_t' + '.mp4')
  })

  return new Promise((res, rej) => {
    notificator.send('transition:in')

    const queue = new PromiseQueue(MAX_CONCURRENT)

    taskDes.forEach(el => {
      const progress = debounce(value => {
        sendProgress(value, i)
      }, 1000, { 'maxWait': 2000 })
      queue.push(() => {
        return applyFade(el.input, el.output, el.fadeIn, el.fadeOut, el.outLast)
      })
      .then(() => {
        progress.cancel()
      })
      .catch(err => {
        console.log(err.message)
        rej(err)
      })
    })

    queue
    .close()
    .then(() => {
      notificator.send('transition:done')
      res({
        notificator,
        meta,
        image: taskDes.map(t => t.output),
        audio,
        output
      })
    })
    .catch(err => {
      notificator.send('transition:fail')
      console.log(err.message)
      rej(err)
    })
  })
}

exports.convert = function ({notificator, meta, image, audio, output}) {

  return new Promise((res, rej) => {
    notificator.send('convert:in')

    const job = videoXaudio2video(image[0].path, audio[0].path, path.resolve(output.path, output.name + '.mp4'))
    job
    .then(() => {
      notificator.send('convert:done')
      res({
        notificator,
        meta,
        image,
        audio,
        output
      })
    })
    .catch(err => {
      notificator.send('convert:fail')
      rej(err)
    })
  })
}