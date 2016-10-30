const os = require('os')
const fs = require('fs')
const path = require('path')
const config = require('../config')

exports.checkAndSetEnv = function () {
  const FFMPEG_PATH = process.env.FFMPEG_PATH || path.resolve(config.appRoot,'./vender/ffmpeg')
  const FFPROBE_PATH = process.env.FFPROBE_PATH || path.resolve(config.appRoot,'./vender/ffprobe')
  const BLACK_IMAGE_PATH = path.resolve(config.appRoot,'./vender/black.jpg')
  try {
    fs.accessSync(FFMPEG_PATH + (os.platform() === 'win32' ? '.exe' : ''), fs.constants.F_OK)
    fs.accessSync(FFPROBE_PATH + (os.platform() === 'win32' ? '.exe' : ''), fs.constants.F_OK)
    fs.accessSync(BLACK_IMAGE_PATH, fs.constants.F_OK)
  } catch (ex) {
    return false
  }

  process.env.FFMPEG_PATH = FFMPEG_PATH
  process.env.FFPROBE_PATH = FFPROBE_PATH
  process.env.BLACK_IMAGE_PATH = BLACK_IMAGE_PATH
  return true
}