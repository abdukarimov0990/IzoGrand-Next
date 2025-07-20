const fs = require('fs')
const path = require('path')

const writeData = (products, works) => {
  const filePath = path.join(__dirname, '../../src/data/data.js')
  const content = `
export const products = ${JSON.stringify(products, null, 2)};
export const works = ${JSON.stringify(works, null, 2)};
`

  fs.writeFileSync(filePath, content, 'utf8')
}

module.exports = writeData
