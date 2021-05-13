const { Network } = require('vis-network/peer/esm/vis-network')
const { DataSet } = require('vis-data/peer/esm/vis-data')
const { Server, Computer, Component, Product } = require('./nodes')
const fs = require('fs')
const csv = require('csv-parser')
const { resolve } = require('path')
/**
 * Graph visualization class
 */
class Visualization {
  /**
   * Create new graph visualization
   * @param {Element} networkContainer
   * @param {Object} option visjs network options @see https://visjs.github.io/vis-network/docs/network/
   */
  constructor(networkContainer, option, onNodeSelected) {
    this.networkContainer = networkContainer
    this.nodes = []
    this.edges = []
    this.onNodeSelectionUpdate = onNodeSelected
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
    this.network.on('selectNode', this.onNodeSelectionUpdate)
    this.network.on('deselectNode', this.onNodeSelectionUpdate)
  }
  /**
   * load visualization of given file
   * @param {string} file path of the report file
   * @returns Promise that resolves with the networks nodes
   */
  loadFromCsv(file) {
    return new Promise((resolve, reject) => {
      document.body.classList.add('waiting')
      this.nodes = []
      this.edges = []
      this.networkData.nodes.clear()
      this.networkData.edges.clear()

      fs.createReadStream(file)
        .pipe(
          csv({
            skipLines: 1,
            headers: [
              'Row No.',
              'Publisher',
              'Imported Part Numbers',
              'Product Name',
              'FlexPoint or Cloud Pak Bundle',
              'Metric Quantity',
              'Metric Peak Value Time',
              'Recalculation Needed',
              'Server Name',
              'Processor',
              'Processor Brand String',
              'PVU Per Core',
              'Changed PVU Per Core',
              'Physical Server CPU Core Subcapacity Limit',
              'Physical Server CPU Core Subcapacity',
              'Physical Server PVU Subcapacity Limit',
              'Physical Server PVU Subcapacity',
              'Comment',
              'Partition Cores',
              'Virtualization Layer ID',
              'Computer',
              'Computer Deleted',
              'OS',
              'IP Address',
              'Product Release',
              'Component',
              'Path',
              'Unconfirmed Product Instance',
              'Computer Last Seen',
              'Exclusion Comment',
            ],
          })
        )
        .on('data', (row) => {
          this.addRow(row)
        })
        .on('end', () => {
          if (this.nodes.length < 3) {
            reject('the file does not contain the required headers')
          }
          this.build()
          document.body.classList.remove('waiting')
          resolve(this.nodes)
        })
    })
  }
  /**
   * Add parased row to the graph's network
   * @param {Array} row parsed file
   */
  addRow(row) {
    //push node to the network
    const server = new Server(row)
    if (!this.nodeExist(server)) {
      this.nodes.push(server)
    }
    //push vm to the network
    const computer = new Computer(row)
    if (!this.nodeExist(computer)) {
      this.nodes.push(computer)
    }

    //add edges between server and computer
    if (!this.edgeExist(server, computer)) {
      this.edges.push({ from: server.id, to: computer.id })
    }

    //push component  to the network
    const component = new Component(row)
    if (!this.nodeExist(component)) {
      this.nodes.push(component)
    }

    //add edges between computer and component
    if (!this.edgeExist(computer, component)) {
      this.edges.push({ from: computer.id, to: component.id })
    }

    //push product to the network
    const product = new Product(row)
    if (!this.nodeExist(product)) {
      this.nodes.push(product)
    }

    //add edges between component and product
    if (!this.edgeExist(component, product)) {
      this.edges.push({ from: component.id, to: product.id })
    }
  }
  /**
   * Check if the given node already exist
   * @param {Server|Computer|Component|Product} node
   * @returns true if the given node already exist otherwise false
   */
  nodeExist(node) {
    return this.nodes.filter((element) => element.id == node.id).length > 0
  }
  /**
   *Check if the given eadge already exist
   * @param {Server|Computer|Component|Product} from
   * @param {Server|Computer|Component|Product} to
   * @returns true if the given eadge already exist otherwise false
   */
  edgeExist(from, to) {
    return (
      this.edges.filter(
        (element) => element.from === from.id && element.to == to.id
      ).length > 0
    )
  }
  /**
   * Move nodes and edges from proxy object to the vis.js dataset objects
   * It starts drawing nodes and edges
   */
  build() {
    this.networkData.nodes.add(this.nodes)
    this.networkData.edges.add(this.edges)
  }

  getNodesContextGraph(selectedNodes) {
    const contextGraph = selectedNodes
    const getParentNode = (nodes) => {
      const parents = []
      for (let i = 0; i < nodes.length; i++) {
        parents.push(
          ...this.edges
            .filter((element) => element.to === nodes[i])
            .map((element) => element.from)
        )
      }
      contextGraph.push(...parents)

      return parents.length === 0 ? [] : getParentNode(parents)
    }
    getParentNode(selectedNodes)
    return [...new Set(contextGraph)]
  }

  showSelectedNodesContextGraph() {
    document.body.classList.add('waiting')
    if (this.network.getSelectedNodes().length === 0) {
      document.body.classList.remove('waiting')
      return new Promise((resolve) => resolve(this.nodes))
    }
    return new Promise((resolve) => {
      const selectedNodes = this.network.getSelectedNodes()
      const parentNodes = this.getNodesContextGraph(selectedNodes)
      const renderedNodes = this.nodes.filter((elm) =>
        parentNodes.includes(elm.id)
      )
      this.networkData.nodes.clear()
      this.networkData.nodes.add(renderedNodes)
      this.network.focus(selectedNodes[0], {
        scale: 0.5,
        animation: {
          duration: 1000,
          easingFunctions: 'easeInOutQuad',
        },
      })
      document.body.classList.remove('waiting')
      resolve(renderedNodes)
    })
  }

  showAllNodes() {
    document.body.classList.add('waiting')
    return new Promise((resolve) => {
      this.networkData.nodes.clear()
      this.networkData.nodes.add(this.nodes)
      document.body.classList.remove('waiting')
      resolve(this.nodes)
    })
  }
}

exports.Visualization = Visualization
