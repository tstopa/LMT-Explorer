/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

import './index.css'
const { Network } = require('vis-network/peer/esm/vis-network')
const { DataSet } = require('vis-data/peer/esm/vis-data')

const nodes = new DataSet([
  {
    id: 1,
    label: 'IBM',
    group: 'root',
  },
  {
    id: 2,
    label: 'IBM(R) SoftLayer One core All Existing',
    group: 'node',
  },
  {
    id: 12,
    label: 'IBM(R) SoftLayer One core All Existing',
    group: 'node',
  },
  {
    id: 3,
    label: 'IBM SoftLayer 6e17f5dc-e8a5-4d90-722f-8d246392',
    group: 'partition',
  },
  {
    id: 13,
    label: 'IBM SoftLayer 6e17f5dc-e8a5-4d90-723f-8d246392',
    group: 'partition',
  },
  {
    id: 4,
    label: 'IBM SoftLayer 6e17f5dc-e8a5-4d90-722f-8d246392',
    group: 'partition',
  },
  {
    id: 5,
    label: 'IBM db2',
    group: 'software_component',
  },
  {
    id: 15,
    label: 'IBM db2',
    group: 'software_component',
  },
  {
    id: 6,
    label: 'IBM DB2 Advanced Enterprise Server Edition Pro',
    group: 'software_component',
  },
  {
    id: 7,
    label: 'IBM DB2 Content Manager',
    group: 'software_product',
  },
  {
    id: 8,
    label: 'IBM DB2 Content Creator',
    group: 'software_product',
  },
  {
    id: 18,
    label: 'IBM DB2 Content Creator',
    group: 'software_product',
  },
])
const edges = new DataSet([
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
  { from: 4, to: 6 },
  { from: 6, to: 7 },
  { from: 6, to: 8 },
  { from: 3, to: 5 },
  { from: 5, to: 7 },
  { from: 5, to: 8 },
  { from: 1, to: 12 },
  { from: 12, to: 13 },
  { from: 13, to: 15 },
  { from: 15, to: 8 },
  { from: 15, to: 18 },
])
const container = document.getElementById('mynetwork')
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
        enabled: true,
        type: 'arrow',
      },
    },
  },
  physics: {
    enabled: false,
  },
  layout: {
    improvedLayout: true,
    hierarchical: {
      direction: 'UD',
      nodeSpacing: 500,
      sortMethod: 'directed', //hubsize, directed.
    },
  },
}
const network = new Network(container, data, options)
