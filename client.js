const extIP = require('external-ip')()
const DigitalOcean = require('do-wrapper')
const cron = require('node-cron')
const ocean = new DigitalOcean(process.env.DO_KEY || '')

console.log('Dropping anchor!')
cron.schedule('* 0,30 * * * *', () => {
  console.log('Running scheduled update')
  update(process.env.DOMAIN, process.env.NAME)
})
update(process.env.DOMAIN, process.env.NAME)

process.on('SIGINT', () => {
  console.log('\nRaising anchor!')
  process.exit()
})

function update(domain, name) {
  console.log(`Updating ${name}.${domain}`)
  getIP()
  .then(ip => {
    setRecord(domain, name, 'a', ip)
  })
  .catch(err => console.error('update error', err.message))
}
function getIP() {
  return new Promise((resolve, reject) => {
    extIP((err, ip) => (err) 
      ? reject(err) 
      : resolve(ip))
  })
}
function setRecord(domain, name, type, ip) {
  console.log(`Setting ${type} record for ${name} to ${ip}`)
  getRecordId(domain, name, 'a')
  .then(id => {
    console.log(`Domain record ID is ${id}`)
    return ocean.domainRecordsUpdate(domain, id, {data:ip})
      .then(res => res.body.domain_record)
  })
  .then(record => {
    console.log('Record updated', record)
  })
  .catch(err => console.error('setRecord error', err.message))
}
function getRecordId(domain, name, type) {
  console.log(`Getting ${type} ID for ${name}.${domain}`)
  return ocean.domainRecordsGetAll(domain)
    .then(res => res.body.domain_records)
    .then(records => records.find(record => (record.name == name) && record.type.toLowerCase() == type))
    .then(record => record.id)
    .catch(err => {
      return ocean.domainsGetAll()
        .then(res => res.body.domains)
        .then(domains => console.log('available domains', domains.map(domain => domain.name)))
    })
}

