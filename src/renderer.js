import './index.css'
const { Visualization } = require('./visualization')
const { FileUpload } = require('./fileUpload')
const container = document.getElementById('mynetwork')
const searchbar = document.getElementById('search')
const searchResults = document.getElementById('search_result')
const { ipcRenderer } = require('electron')
const AdmZip = require('adm-zip')
const uuid = require('uuid')
const tempDirectory = require('temp-dir')

const handleFileUpload = (src) => {
  let filePath = src
  if (filePath.split('.').pop() === 'zip') {
    const zip = new AdmZip(src)
    const zipEntiries = zip.getEntries()
    filePath = tempDirectory + uuid.v4()
    zip.extractEntryTo('pvu_sub_capacity.csv', filePath, true)
    filePath += '/pvu_sub_capacity.csv'
  } else if (filePath.split('.').pop() !== 'csv') {
    return
  }
  document.getElementById('upload').style.display = 'none'
  document.getElementById('visualization').style.display = 'flex'
  visualization.loadFromCsv(filePath).then(() => {
    hydrateSearchResults(searchProducts(visualization.nodes))
  })
}

//create file upload instance
const fileUpload = new FileUpload(
  document.getElementById('upload_container'),
  handleFileUpload
)
document.getElementById('file').addEventListener('click', (evt) => {
  evt.preventDefault()
  ipcRenderer.sendSync('open-file-request')
})
ipcRenderer.on('open-file-request-response', (event, arg) => {
  console.log(arg)
  handleFileUpload(arg)
})

//create visualization instance
const visualization = new Visualization(container)

const searchProducts = (nodes, query) => {
  if (query) {
    return nodes.filter(
      (element) =>
        element.group === 'product' &&
        element.label.toLowerCase().includes(query.toLowerCase())
    )
  }
  return nodes.filter((element) => element.group === 'product')
}
const hydrateSearchResults = (nodes) => {
  searchResults.innerHTML = ''
  for (const node of nodes) {
    const p = document.createElement('p')
    p.innerText = node.id
    p.dataset.id = node.id
    p.addEventListener('click', onResultClick)
    searchResults.appendChild(p)
  }
}
//focus on the selected product
const onResultClick = (evt) => {
  visualization.network.selectNodes([evt.target.dataset.id])
  visualization.network.focus(evt.target.dataset.id, {
    scale: 1,
    animation: {
      duration: 1000,
      easingFunctions: 'easeInOutQuad',
    },
  })
}
//handle searchbox input
searchbar.addEventListener('input', (evt) => {
  hydrateSearchResults(searchProducts(visualization.nodes, evt.target.value))
})
