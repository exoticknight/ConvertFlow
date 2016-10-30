exports.image2video = function (last, image, video, wh) {
  return ['-y', '-loop', '1', '-t', last, '-i', image, '-c:v', 'libx264', '-tune', 'stillimage', '-vf', wh ? `pad=${wh[0]}:${wh[1]}:(ow-iw)/2:(oh-ih)/2` : 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-shortest', video]
}

exports.imageDecrease2video = function (last, image, video, wh) {
  return ['-y', '-loop', '1', '-t', last, '-i', image, '-c:v', 'libx264', '-tune', 'stillimage', '-vf', `scale=${wh[0]}:${wh[1]}:force_original_aspect_ratio=decrease`, '-shortest', video]
}

// NOTE: default 25 frames / second
exports.videoFadeIn = function (video, output, lastSeconds=1, rate=25) {
  return ['-y', '-i', video, '-vf', `fade=in:0:${lastSeconds*rate}`, output]
}

// NOTE: default 25 frames / second
exports.videoFadeOut = function (video, output, startSecond, lastSeconds=1, rate=25) {
  return ['-y', '-i', video, '-vf', `fade=out:${startSecond*rate}:${lastSeconds*rate}`, output]
}

// NOTE: default 25 frames / second
exports.videoFadeInOut = function (video, output, outStartSecond, inLastSeconds=1, outLastSeconds=1, rate=25) {
  return ['-y', '-i', video, '-vf', `fade=in:0:${inLastSeconds*rate},fade=out:${outStartSecond*rate}:${outLastSeconds*rate}`, output]
}

exports.mergeVideo = function (receipt, ouput) {
  return ['-y', '-f', 'concat', '-safe', '0', '-i', receipt, '-c', 'copy', ouput]
}

exports.videoCopyXaudioCopy2video = function (imageVideo, audio, video) {
  return ['-i', imageVideo, '-i', audio, '-c:v', 'copy', '-c:a', 'copy', '-y', video]
}

exports.imageXaudio2video = function (image, audio, video) {
  return ['-y', '-loop', '1', '-i', image, '-i', audio, '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', 'aac', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-shortest', video]
}

exports.cutAudio = function (input, output, start, last) {
  return last
    ? ['-y', '-t', last, '-ss', start, '-i', input, '-acodec', 'copy', output]
    : ['-y', '-ss', start, '-i', input, '-acodec', 'copy', output]
}

exports.mp42ts = function (mp4, ts) {
  return ['-i', mp4, '-c', 'copy', '-bsf:v', 'h264_mp4toannexb', '-f', 'mpegts', ts]
}

exports.extractAudioTrack = function (input, output) {
  return
}

// identify
exports.identifyImageWidthHeight = function (image) {
  return ['-format', '%[fx:w] %[fx:h]', image]
}

// convert
exports.convertImageWidthHeight = function (image, output, width, height) {
  return [image, '-gravity', 'center', '-background', 'black', '-extent', width + 'x' + height, output]
}