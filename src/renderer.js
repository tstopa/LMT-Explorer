/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

import { resolve } from 'path'
import './index.css'
const { ipcRenderer } = require('electron')
const { Network } = require('vis-network/peer/esm/vis-network')
const { DataSet } = require('vis-data/peer/esm/vis-data')
const fs = require('fs')
const readline = require('readline')
const csv = require('csv-parser')

const container = document.getElementById('mynetwork')

const nodes = new DataSet([])
const edges = new DataSet([])

const data = {
  nodes: nodes,
  edges: edges,
}

const options = {
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

  layout: {
    improvedLayout: true,
    hierarchical: {
      direction: 'UD',
      nodeSpacing: 350,
      sortMethod: 'hubsize',
    },
  },
}

const network = new Network(container, data, options)

network.on('click', function (properties) {
  const ids = properties.nodes
  if (ids.length === 1) {
    const clickedNode = nodes.get(ids[0])
    console.log('clicked:', clickedNode)
  }
})

function loadFile(event) {
  return new Promise((resolve) => {
    fs.createReadStream('test/data.csv')
      .pipe(csv())
      .on('data', (row) => {
        margeToThree(row)
      })
      .on('end', () => {
        console.log('CSV file successfully processed')
      })

    resolve()
  })
}

const margeToThree = (row) => {
  const NODE_TYPES = ['Server Name', 'Computer', 'Component', 'Product Name']

  for (const nodeTypeID of NODE_TYPES.keys()) {
    //top level nodes dont have parents
    if (nodeTypeID === 0) {
      const label = row[NODE_TYPES[nodeTypeID]]
      if (nodes.get(label) == null) {
        nodes.add({
          id: label,
          label: label,
          group: nodeTypeID,
          level: nodeTypeID,
        })
      }
    } else {
      const parent = row[NODE_TYPES[nodeTypeID - 1]]
      const label = row[NODE_TYPES[nodeTypeID]]
      if (nodes.get(label) == null) {
        nodes.add({
          id: label,
          label:
            nodeTypeID === 3
              ? `${label} (${row['Metric Quantity']} PVU)`
              : label,
          group: nodeTypeID,
          level: nodeTypeID,
        })
      }

      if (
        network
          .getConnectedEdges(parent)
          .filter((element) => edges.get(element).to == label).length == 0
      ) {
        edges.add({
          from: parent,
          to: label,
        })
      }
    }
  }
}

loadFile()
