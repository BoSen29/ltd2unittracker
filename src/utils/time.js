export function timeSince(date) {

  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    const value = Math.floor(interval)
    return value + (value > 1 ? " years" : " year")
  }
  interval = seconds / 2592000
  if (interval > 1) {
    const value = Math.floor(interval)
    return value + (value > 1 ? " months" : " month")
  }
  interval = seconds / 86400
  if (interval > 1) {
    const value = Math.floor(interval)
    return value + (value > 1 ? " days" : " day")
  }
  interval = seconds / 3600
  if (interval > 1) {
    const value = Math.floor(interval)
    return value + (value > 1 ? " hours" : " hour")
  }
  interval = seconds / 60
  if (interval > 1) {
    const value = Math.floor(interval)
    return value + (value > 1 ? " minutes" : " minute")
  }

  const value = Math.floor(seconds)
  return value + (value > 1 ? " seconds" : " second")
}
