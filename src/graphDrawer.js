import Chart from 'chart.js/auto'
import { create } from 'domain'
import { resolve } from 'path'
import { forEach } from 'vis-util'

const fs = require('fs')
const csv = require('csv-parser')
const hermes = require('./hermes')

//Visualization chart class

class Graph {
	/**
	 *
	 * @param {String} ctx path to file with data over time
	 * @param {Object} options chartjs drawing options
	 */
	constructor(ctx, options) {
		this.ctx = ctx
		this.options = options
		this.config = {
			type: 'line',
			data: {
				labels: [],
				datasets: [],
			},
			options: {
				elements: {
					point: {
						radius: 0,
						hitRadius: 3,
					},
				},
				plugins: {
					title: {
						display: true,
						text: 'Metric usage over time',
						font: {
							size: '25rem',
						},
					},
					legend: {
						display: false,
						onClick: () => {},
						position: 'bottom',
						align: 'start',
					},
				},
			},
		}

		this.allData = []
		this.chart = new Chart(this.ctx, this.config)
		this.selectedProducts = []

		hermes.on('sidebarProductSelection', (evt) => {
			this.selectedProducts = evt
		})

		hermes.on('clickShowSelected', () => {
			this.adjustGraphData()
		})

		hermes.on('clickShowAll', () => {
			this.showAllData()
		})
	}

	adjustGraphData() {
		let tempDataset = []

		this.config.data.datasets.forEach((product) => {
			this.selectedProducts.forEach((element) => {
				if (element === product.label) tempDataset.push(product)
			})
		})
		this.chart.data.datasets = tempDataset

		this.chart.update()

		this.legendGenerator(this.chart.getSortedVisibleDatasetMetas())
	}

	showAllData() {
		this.chart.data.datasets = this.allData

		this.chart.update()

		this.legendGenerator(this.chart.getSortedVisibleDatasetMetas())
	}

	legendGenerator(legendInformation) {
		let legend = document.getElementById('legend')
		legend.innerHTML = ''

		legendInformation.forEach((item) => {
			let ProductColor = item._dataset.borderColor
			let HTMLElement = document.createElement('div')
			let colorDiv = document.createElement('div')

			HTMLElement.className = 'legend-wrapper'
			colorDiv.className = 'legend-item'
			colorDiv.style.backgroundColor = ProductColor

			legend.appendChild(HTMLElement)

			let newChild = legend.children[item.index]

			newChild.appendChild(colorDiv)
			let text = document.createElement('p')
			text.className = 'legend-subs'
			text.innerHTML = `  ${item.label}`

			newChild.appendChild(text)
		})
	}

	createLabel(productName, measurements, color) {
		let dataset = {
			label: productName,
			borderColor: color,
			data: measurements,
		}
		this.config.data.datasets.push(dataset)
	}

	colorCreator(numOfSteps, step) {
		let r, g, b
		let h = step / numOfSteps
		let i = ~~(h * 6)
		let f = h * 6 - i
		let q = 1 - f
		switch (i % 6) {
			case 0:
				r = 1
				g = f
				b = 0
				break
			case 1:
				r = q
				g = 1
				b = 0
				break
			case 2:
				r = 0
				g = 1
				b = f
				break
			case 3:
				r = 0
				g = q
				b = 1
				break
			case 4:
				r = f
				g = 0
				b = 1
				break
			case 5:
				r = 1
				g = 0
				b = q
				break
		}
		let c =
			'rgb(' + ~~(r * 255) + ',' + ~~(g * 255) + ',' + ~~(b * 255) + ')'
		return c
	}

	loadFromCsv(file) {
		const files = fs.readdirSync(file)
		let fileName = file + '\\'
		files.map((file) => {
			if (file.startsWith('products_daily')) fileName += file
		})

		let currentProductName = ''
		let label = new Set()
		let currentMeasurements = []
		let colorNumber = 0
		let colorStep = 29

		return new Promise((resolve, reject) => {
			fs.createReadStream(fileName)
				.pipe(
					csv({
						skipLines: 1,
						headers: [
							'date',
							'name',
							'id',
							'metricName',
							'metricQuantity',
							'clusterId',
						],
					})
				)
				.on('data', (row) => {
					if (currentProductName !== row.name) {
						this.createLabel(
							currentProductName,
							currentMeasurements,
							this.colorCreator(200, colorNumber)
						)
						colorNumber += colorStep
						colorNumber %= 200
						currentMeasurements = []
						currentProductName = row.name
					}
					currentMeasurements.push(row.metricQuantity)
					label.add(row.date)
				})
				.on('end', () => {
					colorNumber += colorStep
					this.createLabel(
						currentProductName,
						currentMeasurements,
						this.colorCreator(200, colorNumber)
					)
					this.config.data.datasets.shift()
					this.config.data.labels = Array.from(label)

					this.allData = this.config.data.datasets

					this.showAllData()
					if (this.config.data.datasets < 1) reject('no data in file')
					resolve('output')
				})
		})
	}
}

export default Graph
