const fs = require('fs')
const csv = require('csv-parser')

class Summary {
  constructor(element) {
    this.element = element
  }
  readFromFile(src) {
    return new Promise((resolve, reject) => {
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
              'Imported Part Numbers',
              'Recalculation Needed',
            ],
          })
        )
        .on('data', (row) => {
          console.log(row)
          const tr = document.createElement('tr')
          const productNameTd = document.createElement('td')
          productNameTd.innerText = row['Product Name']
          const metricTd = document.createElement('td')
          metricTd.innerText = row['Metric']
          const metricQunanitiyTd = document.createElement('td')
          metricQunanitiyTd.innerText = row['Metric Quantity']
          tr.append(productNameTd, metricTd, metricQunanitiyTd)
          document.querySelector('#summary table').appendChild(tr)
        })
        .on('end', () => {
          resolve()
        })
    })
  }
}

exports.Summary = Summary
