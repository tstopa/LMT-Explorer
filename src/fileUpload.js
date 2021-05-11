/**
 * Drag&drop file handler
 */
class FileUpload {
  /**
   * create new drag&drop file handler
   * @param {Element} fileUploadElement
   * @param {Function} onDrop
   */
  constructor(fileUploadElement, onDrop) {
    this.fileUploadElement = fileUploadElement
    this.onDrop = onDrop
    this.fileUploadElement.addEventListener('dragenter', (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
      evt.target.classList.add('draged')
    })
    this.fileUploadElement.addEventListener('dragleave', (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
      evt.target.classList.remove('draged')
    })
    this.fileUploadElement.addEventListener('dragover', (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
    })
    this.fileUploadElement.addEventListener('drop', (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
      const dt = evt.dataTransfer
      this.onDrop(dt.files[0].path)
    })
  }
}
exports.FileUpload = FileUpload
