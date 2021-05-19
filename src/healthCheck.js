const fs = require('fs')

const ILMT_VERSION = '9.2.24.0'

class HealthCheck {
  constructor(component) {}
  readFromFile(src) {
    fs.readFile(src, 'utf8', (err, data) => {
      this.render(this.parse(data))
    })
  }
  parse(data) {
    const lines = data.split('\n')
    let ctx = ''
    const result = {}
    for (const line of lines) {
      if (line.trim()[line.trim().length - 1] === ':') {
        ctx = line.trim().slice(0, line.trim().length - 1)
        result[ctx] = []
      } else {
        result[ctx].push(line.trim())
      }
    }
    return result
  }
  render(results) {
    const startDate = document.getElementById('start-date')
    const endDate = document.getElementById('end-date')
    const allComputersIncluded = document.getElementById(
      'all-computers-included'
    )
    const lmtVersion = document.getElementById('lmt-version')
    const importsPassing = document.getElementById('imports-passing')
    const coveredAllDiscavered = document.getElementById(
      'covered-all-discavered'
    )
    const licenceCalculationCover = document.getElementById(
      'licence-calculation-cover'
    )
    const delayedDataUpload = document.getElementById('delayed-data-upload')
    const outDatedCapacityScans = document.getElementById(
      'outdated-capacity-scans'
    )
    const missingSoftwareScans = document.getElementById(
      'missing-software-scans'
    )

    startDate.innerText = results['Start Date'][0]
    endDate.innerText = results['End Date'][0]
    allComputersIncluded.innerText =
      results['Computer Group Name'][0] == 'All Computers' ? 'Yes' : 'No'
    allComputersIncluded.classList.add(
      allComputersIncluded.innerText == 'Yes' ? 'success' : 'warrning'
    )
    lmtVersion.innerText = results['Audit snapshot generated in'][0]
      .split(' ')
      .pop()
      .split('-')[0]
    lmtVersion.classList.add(
      lmtVersion.innerText == ILMT_VERSION ? 'success' : 'warrning'
    )
    importsPassing.innerText = results['Import Status'][0].includes(
      'finished successfully'
    )
      ? 'Yes'
      : 'No'
    importsPassing.classList.add(
      importsPassing.innerText == 'Yes' ? 'success' : 'warrning'
    )
    coveredAllDiscavered.innerHTML =
      results['Used filters'].length == 0 ||
      (results['Used filters'].length == 1 &&
        results['Used filters'][0].includes(
          `"FlexPoint or Cloud Pak Bundle" in set None`
        ))
        ? 'Yes'
        : 'No'
    coveredAllDiscavered.classList.add(
      coveredAllDiscavered.innerText == 'Yes' ? 'success' : 'warrning'
    )
    licenceCalculationCover.innerHTML = results[
      'Recalculation Status'
    ][0].includes('Recalculation is not needed')
      ? 'Yes'
      : 'No'
    licenceCalculationCover.classList.add(
      licenceCalculationCover.innerText == 'Yes' ? 'success' : 'warrning'
    )
    delayedDataUpload.innerHTML = results['Data accuracy'][0]
      .split(':')[1]
      .trim()
    delayedDataUpload.classList.add(
      parseInt(delayedDataUpload.innerText) <= 10 ? 'success' : 'error'
    )
    outDatedCapacityScans.innerHTML = results['Data accuracy'][1]
      .split(':')[1]
      .trim()
    outDatedCapacityScans.classList.add(
      parseInt(outDatedCapacityScans.innerText) <= 10 ? 'success' : 'error'
    )
    missingSoftwareScans.innerHTML = results['Data accuracy'][2]
      .split(':')[1]
      .trim()
    missingSoftwareScans.classList.add(
      parseInt(missingSoftwareScans.innerText) <= 10 ? 'success' : 'error'
    )
  }
}
exports.HealthCheck = HealthCheck
