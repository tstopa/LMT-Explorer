const hermes = require('./hermes')
class Sidebar {
	constructor(searchbar, searchResults) {
		this.searchbar = searchbar
		this.searchResults = searchResults
		this.selectedNodes = []
		this.nodes = []
		this.searchbar.addEventListener('input', (evt) => {
			this.hydrateSearchResults(
				this.searchProducts(this.nodes, evt.target.value)
			)
		})
		hermes.on('visualizationProductSelection', (evt) => {
			this.updateNodesSelection(evt)
		})
		document
			.getElementById('show-selected')
			.addEventListener('click', () => {
				hermes.send('clickShowSelected')
			})
		document.getElementById('show-all').addEventListener('click', () => {
			hermes.send('clickShowAll')
		})
		hermes.on('updateProducts', (evt) => {
			this.node = evt
			this.hydrateSearchResults(evt)
		})
	}
	updateNodesSelection(selectedNodes) {
		console.log(selectedNodes)
		this.selectedNodes = selectedNodes
		for (const element of this.searchResults.childNodes) {
			if (selectedNodes.includes(element.dataset.id)) {
				element.classList.add('selected')
			} else {
				element.classList.remove('selected')
			}
		}
	}
	searchProducts(nodes, query) {
		if (query) {
			return nodes.filter((element) =>
				element.toLowerCase().includes(query.toLowerCase())
			)
		}
		return nodes
	}
	hydrateSearchResults(nodes) {
		if (this.nodes.length === 0) {
			this.nodes = nodes
		}
		this.searchResults.innerHTML = ''
		for (const node of nodes) {
			const p = document.createElement('p')
			p.innerText = node
			p.dataset.id = node
			if (this.selectedNodes.includes(node)) {
				p.classList.add('selected')
			}
			p.addEventListener('click', this.onProductClick.bind(this))
			this.searchResults.appendChild(p)
		}
	}
	onProductClick(evt) {
		if (window.event.ctrlKey) {
			if (evt.target.classList.contains('selected')) {
				this.selectedNodes = this.selectedNodes.filter(
					(elm) => elm !== evt.target.dataset.id
				)
			} else {
				this.selectedNodes.push(evt.target.dataset.id)
			}
		} else {
			this.selectedNodes = [evt.target.dataset.id]
		}
		this.updateNodesSelection(this.selectedNodes)
		hermes.send('sidebarProductSelection', this.selectedNodes)
	}
}

exports.Sidebar = Sidebar
