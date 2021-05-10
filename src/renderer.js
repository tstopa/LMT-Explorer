import './index.css'
const { Visualization } = require('./visualization')

const container = document.getElementById('mynetwork')
const searchbar = document.getElementById('search')
const searchResults = document.getElementById('search_result')
//create visualization instance
const visualization = new Visualization(container)
//load data from csv
visualization.loadFromCsv('test/__data.csv').then(() => {
  hydrateSearchResults(searchProducts(visualization.nodes))
})
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
