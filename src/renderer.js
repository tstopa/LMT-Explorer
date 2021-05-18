import './index.css'
const { Visualization } = require('./visualization')
const { FileUpload } = require('./fileUpload')
const { Sidebar } = require('./sidebar')
const { ipcRenderer } = require('electron')
const { Router, Route } = require('./router')
const AdmZip = require('adm-zip')
const uuid = require('uuid')
const tempDirectory = require('temp-dir')

const pvu = new Route(
  'pvu',
  document.getElementById('pvu'),
  document.getElementById('pvu-tab')
)
const daily = new Route(
  'daily',
  document.getElementById('daily'),
  document.getElementById('daily-tab')
)
const router = new Router([pvu, daily])
router.show('pvu')

const handleFileUpload = (src) => {
  let filesPath = ''
  if (src.split('.').pop() !== 'zip') {
    ipcRenderer.send('show-error', 'Select ILMT snapshot zip archive')
  }
  try {
    const zip = new AdmZip(src)
    filesPath = tempDirectory + uuid.v4()
    zip.extractEntryTo('pvu_sub_capacity.csv', filesPath, true)
  } catch (exception) {
    ipcRenderer.send(
      'show-error',
      'It looks like the selected archive does not contain the appropriate files or there is not enough disk space on this computer to unpack it'
    )
    return
  }

  document.getElementById('upload').style.display = 'none'
  document.getElementById('main').style.display = 'flex'
  pvuSubCapacityVisualization
    .loadFromCsv(filesPath + '/pvu_sub_capacity.csv')
    .then(() => {
      sidebar.hydrateSearchResults(
        pvuSubCapacityVisualization.nodes
          .filter((elm) => elm.group == 'product')
          .map((elm) => elm.id)
      )
    })
    .catch((error) => {
      ipcRenderer.send('show-error', 'The snapshot file is corrupted')
      document.getElementById('upload').style.display = 'flex'
      document.getElementById('main').style.display = 'none'
      return
    })
}
//create file upload instance
const fileUpload = new FileUpload(
  document.getElementById('upload_container'),
  handleFileUpload
)
document.getElementById('file').addEventListener('click', (evt) => {
  evt.preventDefault()
  ipcRenderer.send('open-file-request')
})
ipcRenderer.on('open-file-request-response', (event, arg) => {
  handleFileUpload(arg)
})

const sidebar = new Sidebar(
  document.getElementById('search'),
  document.getElementById('search_result')
)
//create visualization instance
const pvuSubCapacityVisualization = new Visualization(
  document.getElementById('pvu'),
  {},
  'PVU'
)
