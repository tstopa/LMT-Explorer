import './index.css'
const { Visualization } = require('./visualization')
const { FileUpload } = require('./fileUpload')
const { ipcRenderer } = require('electron')
const AdmZip = require('adm-zip')
const uuid = require('uuid')
const { Router, Route } = require('./router')
const tempDirectory = require('temp-dir')
const searchbar = document.getElementById('search')
const searchResults = document.getElementById('search_result')

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
      hydrateSearchResults(searchProducts(pvuSubCapacityVisualization.nodes))
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

//on node selection update handler
const onNodeSelectionUpdate = () => {
  const selectedNodes = pvuSubCapacityVisualization.network.getSelectedNodes()
  for (const element of searchResults.childNodes) {
    if (selectedNodes.includes(element.dataset.id)) {
      element.classList.add('selected')
    } else {
      element.classList.remove('selected')
    }
  }
  //TODO get selected graph for daily usage plot
}
//create visualization instance
const pvuSubCapacityVisualization = new Visualization(
  document.getElementById('pvu'),
  {},
  onNodeSelectionUpdate
)

//search for products
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

//update search results
const hydrateSearchResults = (nodes) => {
  searchResults.innerHTML = ''
  for (const node of nodes) {
    const p = document.createElement('p')
    p.innerText = node.id
    p.dataset.id = node.id
    p.addEventListener('click', onResultClick)
    searchResults.appendChild(p)
  }
  onNodeSelectionUpdate()
}
//focus on the selected product
const onResultClick = (evt) => {
  if (window.event.ctrlKey) {
    if (evt.target.classList.contains('selected')) {
      pvuSubCapacityVisualization.network.selectNodes(
        pvuSubCapacityVisualization.network
          .getSelectedNodes()
          .filter((elm) => elm !== evt.target.dataset.id)
      )
    } else {
      pvuSubCapacityVisualization.network.selectNodes([
        ...pvuSubCapacityVisualization.network.getSelectedNodes(),
        evt.target.dataset.id,
      ])
    }
  } else {
    pvuSubCapacityVisualization.network.selectNodes([evt.target.dataset.id])
  }
  onNodeSelectionUpdate()
  pvuSubCapacityVisualization.network.focus(evt.target.dataset.id, {
    scale: 1,
    animation: {
      duration: 1000,
      easingFunctions: 'easeInOutQuad',
    },
  })
}
//handle search
searchbar.addEventListener('input', (evt) => {
  hydrateSearchResults(
    searchProducts(
      pvuSubCapacityVisualization.networkData.nodes.map((e) => e),
      evt.target.value
    )
  )
})
//show only selected
document.getElementById('show-selected').addEventListener('click', () => {
  pvuSubCapacityVisualization.showSelectedNodesContextGraph().then((result) => {
    hydrateSearchResults(searchProducts(result))
  })
})
//show all
document.getElementById('show-all').addEventListener('click', () => {
  pvuSubCapacityVisualization.showAllNodes().then((result) => {
    hydrateSearchResults(searchProducts(result))
  })
})
