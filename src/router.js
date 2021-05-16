const { forEach } = require('vis-util')

class Router {
  constructor(routes) {
    this.routes = routes
    routes.forEach((route) => {
      route.triggerElement.addEventListener('click', (evt) => {
        this.show(route.name)
      })
    })
  }
  show(routeName) {
    this.routes.forEach((route) => {
      if (route.name === routeName) {
        route.state = 'active'
        route.element.style.display = 'block'
        route.triggerElement.classList.add('active')
      } else {
        route.state = 'inactive'
        route.element.style.display = 'none'
        route.triggerElement.classList.remove('active')
      }
    })
  }
}
class Route {
  constructor(name, element, triggerElement) {
    this.name = name
    this.element = element
    this.state = 'inactive'
    this.triggerElement = triggerElement
  }
}
exports.Router = Router
exports.Route = Route
