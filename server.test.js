const request = require('supertest')
const app = require('.')
const jwt = require('jsonwebtoken')
const token = jwt.sign({
  domain: 'test'
}, 'test')

it('returns 200 if up', () => {
  return request(app)
    .get('/')
    .expect(200)
})
it('returns 401 if no token', () => {
  return request(app)
    .get('/ping')
    .expect(401)
})
it('returns 401 if token invalid', () => {
  return request(app)
    .get('/ping')
    .set('Authorization', 'bad-token')
    .expect(401)
})
it('return 200 if token valid', () => {
  return request(app)
    .get('/ping')
    .set('Authorization', token)
    .expect(200, {
      domain: 'test',
      ip: 'test',
      type: 'a',
    })
})
function it(title, fn) {
  fn()
    .then(() => {
      console.log('[\u2713]', title)
    })
    .catch(err => {
      console.error('[!]', title)
      console.error('    > ', err.message)
    })
}
