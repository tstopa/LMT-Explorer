import './index.css'
import Graph from './graphDrawer'
const { Visualization } = require('./visualization')
const { FileUpload } = require('./fileUpload')
const { Sidebar } = require('./sidebar')
const { ipcRenderer } = require('electron')
const { Router, Route } = require('./router')
const { HealthCheck } = require('./healthCheck')
const { Summary } = require('./summary')
const { CloudPakVisualizator } = require('./cloudPakVisualizator')
const AdmZip = require('adm-zip')
const uuid = require('uuid')
const tempDirectory = require('temp-dir')

//define routes
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
const cloudpak = new Route(
	'cloudpak',
	document.getElementById('cloudpak'),
	document.getElementById('cloudpak-tab')
)
const health = new Route(
	'health',
	document.getElementById('health'),
	document.getElementById('health-tab')
)
const summary = new Route(
	'summary',
	document.getElementById('summary'),
	document.getElementById('summary-tab')
)
//create router
const router = new Router([pvu, daily, cloudpak, health, summary])
//show pvu route
router.show('pvu')

//load file
const handleFileUpload = (src) => {
	let filesPath = ''
	if (src.split('.').pop() !== 'zip') {
		ipcRenderer.send('show-error', 'Select ILMT snapshot zip archive')
	}
	try {
		const zip = new AdmZip(src)
		filesPath = tempDirectory + uuid.v4()
		zip.extractAllTo(filesPath, true)
	} catch (exception) {
		ipcRenderer.send(
			'show-error',
			'It looks like the selected archive does not contain the appropriate files or there is not enough disk space on this computer to unpack it'
		)
		return
	}

	document.getElementById('upload').style.display = 'none'
	document.getElementById('main').style.display = 'flex'
	summaryView.readFromFile(filesPath + '/audit_snapshot_summary.csv')
	healthCheck.readFromFile(filesPath + '/data_condition.txt')
	cloudPakVisualizator.readFromFile(filesPath + '/cloud_paks.csv')
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

	metricUsageInTime.loadFromCsv(filesPath).catch((error) => {
		console.log('graph do not work')
		console.log(error)
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

const metricUsageInTime = new Graph(document.getElementById('graph'), 'options')

const cloudPakVisualizator = new CloudPakVisualizator(
	document.getElementById('cloudpak'),
	{}
)
const healthCheck = new HealthCheck(document.getElementById('health'))
const summaryView = new Summary(document.getElementById('summary'))
