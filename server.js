const express = require('express')
const DigitalOcean = require('do-wrapper')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()
const di = new DigitalOcean('[api_key]')
/* GET ping with a JWT token
 * Token contains domain name
 * If token is signed with client secret 
 *  update domain with client ip
 */

app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.sendStatus(200)
})
app.get('/ping', auth, (req, res) => {
  if (!req.user['domain']) res.error('missing domain key')
  res.send({
    domain: req.user.domain,
    ip: 'test',
    type: 'a',
  })
})

function auth(req,res,next) {
  const token = req.get('Authorization')
  if (token) {
    jwt.verify(token, 'test', (err, data) => {
      if (err) return res.sendStatus(401)
      req.user = {
        domain: data.domain,
      }
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

app.post('/ping', (req, res) => { 
  const {name} = req.body
  const ip = req.ip
  console.log(`request to update ${name} to ${ip}`)
  updateDomain(name, ip)
  res.send('OK')
})

app.listen(3000, () => {
  console.log('Started on :5353')
})

function updateDomain(name, ip) {
  getARecordId(name)
   .then(id => {
     console.log('Record ID', id)
   })
  .catch(err => {
    console.error(err)
  })
}

function getARecordId(name) {
  return di.domainRecordsGetAll(name, (records, err) => {
   return Promise.resolve(records)
  })
}

module.exports = app
