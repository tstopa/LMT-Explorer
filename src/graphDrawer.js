import Chart from 'chart.js/auto'
import { create } from 'domain'
import { resolve } from 'path'

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
		this.colors = [
			'rgb(255,255,0)',
			'rgb(0,255,255)',
			'rgb(255,0,0)',
			'rgb(255,0,255)',
			'rgb(0,255,0)',
			'rgb(0,0,255)',
		]
		this.ctx = ctx
		this.options = options
		this.config = {
			type: 'line',
			data: {
				labels: [],
				datasets: [],
			},
			options: {},
		}

		this.chart = new Chart(this.ctx, this.config)
	}

	createLabel(productName, measurements, color) {
		let dataset = {
			label: productName,
			color: color,
			data: measurements,
		}

		this.config.data.datasets.push(dataset)
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
		let colors = this.colors

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
							colors.pop()
						)

						currentMeasurements = []
						currentProductName = row.name
					}
					currentMeasurements.push(row.metricQuantity)
					label.add(row.date)
				})
				.on('end', () => {
					this.createLabel(currentProductName, currentMeasurements)
					this.config.data.datasets.shift()
					this.config.data.labels = Array.from(label)

					if (this.config.data.datasets < 1) reject('no data in file')
					resolve('output')
				})
		})
	}
}

export default Graph
