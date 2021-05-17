/**
 * The server class represents the physical part of the infrastructure
 * in the domain language node
 */
class Server {
  /**
   * To create the Server node object, provide parsed row of the ILMT report file
   * @param {Array} row
   */
  constructor(row) {
    this.id = row['Server Name']
    this.label = row['Server Name']
    this.group = 'server'
    this.level = 0
  }
}
/**
 * The Computer class represents virtual machines installed on physical servers,
 * in the domain language partition
 */
class Computer {
  /**
   * To create the Computer node object, provide parsed row of the ILMT report file
   * @param {Array} row
   */
  constructor(row) {
    this.id = row['Computer']
    this.label = row['Computer']
    this.group = 'computer'
    this.level = 1
  }
}
/**
 * Class represents Software Components
 */
class Component {
  /**
   * To create the Software Components node object, provide parsed row of the ILMT report file
   * @param {Array} row
   */
  constructor(row) {
    this.id = row['Component']
    this.label = row['Component']
    this.group = 'component'
    this.level = 2
  }
}
/**
 * Class represents Software Product
 */
class Product {
  /**
   * To create the product node object, provide parsed row of the ILMT report file
   * @param {Array} row
   */
  constructor(row, metric) {
    this.id = row['Product Name']
    this.label =
      row['Product Name'] +
      '\n <b>' +
      row['Metric Quantity'] +
      ' ' +
      metric +
      '</b>'
    this.group = 'product'
    this.level = 3
    this.pvu = row['Metric Quantity']
    this.font = { multi: 'html' }
  }
}
exports.Server = Server
exports.Computer = Computer
exports.Component = Component
exports.Product = Product
