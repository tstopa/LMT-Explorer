function on(event, callback) {
  document.addEventListener(event, (evt) => callback(evt.detail))
}
function off(event, callback) {
  document.removeEventListener(event, (evt) => callback(evt.detail))
}
function send(event, data) {
  document.dispatchEvent(new CustomEvent(event, { detail: data }))
}
exports.on = on
exports.off = off
exports.send = send
