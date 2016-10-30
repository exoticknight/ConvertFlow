export function checkFileType (path, extensions) {
  return extensions.map(el => {
    let re = new RegExp('\\.' + el + '$', 'ig')
    return re.test(path)
  }).some(e => e)
}

export function formatDurationSecond (totalSecond) {
  return {
    hour: ~~(totalSecond / 3600),
    minute: ~~(totalSecond / 60 % 60),
    second: ~~(totalSecond % 60)
  }
}

export function leftpad (str, len, ch) {
  str = str + ''

  len = len - str.length
  if (len <= 0) return str

  if (!ch && ch !== 0) ch = ' '
  ch = ch + ''

  if (len > 0) {
    return ch.repeat(len) + str
  }

  return str
}
