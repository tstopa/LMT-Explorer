const { Network } = require('vis-network/peer/esm/vis-network')
const { DataSet } = require('vis-data/peer/esm/vis-data')
const hermes = require('./hermes')
const fs = require('fs')
const csv = require('csv-parser')

class Bundle {
  constructor(row) {
    this.id = row['FlexPoint or Cloud Pak Bundle'] + ' [Bundle]'
    this.label = row['FlexPoint or Cloud Pak Bundle']
    this.group = 'bundle'
    this.level = 2
  }
}
class Product {
  constructor(row) {
    this.id = row['Product Name'] + ' [Product]'
    this.label =
      row['Product Name'] +
      '\n<b>' +
      row['Metric Quantity'] +
      ' ' +
      row['Metric'].match(/[A-Z]/g).join('') +
      '</b>'
    this.group = 'product'
    this.level = 1
    this.metricQuantity = row['Metric Quantity']
    this.metric = row['Metric']
    this.font = { multi: 'html' }
  }
}

class CloudPakVisualizator {
  constructor(networkContainer, option) {
    this.networkContainer = networkContainer
    this.nodes = []
    this.edges = []
    this.networkData = {
      nodes: new DataSet([]),
      edges: new DataSet([]),
    }
    this.networkOptions = {
      height: '100%',
      width: '100%',
      nodes: {
        shape: 'dot',
        font: {
          color: 'black',
        },
      },
      edges: {
        smooth: false,
        arrows: {
          to: {
            enabled: false,
            type: 'arrow',
          },
        },
        chosen: true,
        color: {
          color: '#bbbbbb',
          highlight: '#0000FF',
          inherit: 'from',
          opacity: 0.5,
        },
      },
      physics: {
        enabled: false,
      },
      interaction: { multiselect: true },
      layout: {
        improvedLayout: true,
        hierarchical: {
          direction: 'UD',
          nodeSpacing: 350,
          sortMethod: 'directed',
        },
      },
    }
    this.network = new Network(networkContainer, this.networkData, {
      ...this.networkOptions,
      ...option,
    })
  }
  readFromFile(src) {
    return new Promise((resolve, reject) => {
      this.nodes = []
      this.edges = []

      fs.createReadStream(src)
        .pipe(
          csv({
            skipLines: 1,
            headers: [
              'Row No.',
              'Publisher',
              'Product Name',
              'FlexPoint or Cloud Pak Bundle',
              'Metric',
              'Metric Quantity',
              'Peak Date',
              'Bundle Metric Contribution',
              'Imported Part Numbers',
              'Recalculation Needed',
            ],
          })
        )
        .on('data', (row) => this.addRow(row))
        .on('end', (row) => {
          this.build()
          if (this.nodes.length < 3) {
            reject('the file does not contain the required headers')
          }
          console.log(this.nodes)
          resolve(this.nodes)
        })
    })
  }
  addRow(row) {
    const product = new Product(row)
    if (!this.nodeExist(product)) {
      this.nodes.push(product)
    }
    const bundle = new Bundle(row)
    if (!this.nodeExist(bundle)) {
      this.nodes.push(bundle)
    }
    if (!this.edgeExist(product, bundle)) {
      this.edges.push({
        from: product.id,
        to: bundle.id,
        label: row['Bundle Metric Contribution'],
      })
    }
  }
  nodeExist(node) {
    return this.nodes.filter((element) => element.id == node.id).length > 0
  }
  edgeExist(from, to) {
    return (
      this.edges.filter(
        (element) => element.from === from.id && element.to == to.id
      ).length > 0
    )
  }
  build() {
    this.networkData.nodes.add(this.nodes)
    this.networkData.edges.add(this.edges)
  }
}
exports.CloudPakVisualizator = CloudPakVisualizator
