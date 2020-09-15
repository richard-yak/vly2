import test from 'ava'
import MemoryMongo from '../../../util/test-memory-mongo'
import { server, appReady } from '../../../server'
import request from 'supertest'
import sinon from 'sinon'
import AliasSet from '../aliasSet'
import { aliases } from './tagUI.fixture'
import { jwtData as jwtAdmin} from '../../../../server/middleware/session/__tests__/setSession.fixture'

test.before('before connect to database', async (t) => {
  t.context.memMongo = new MemoryMongo()
  await t.context.memMongo.start()
  await Person.create(people)

  t.context.sandbox = sinon.createSandbox()
  await appReady
})

test.afterEach.always(async (t) => {
  await AliasSet.deleteMany()
})

test.after.always(async (t) => {
  await t.context.memMongo.stop()
})

test.failing('Return an empty array when there are no aliases in the DB', async (t) => {
  const res = await request(server).get('/api/tagUI/allAliases').expect(200).expect('Content-Type', /json/)

  t.deepEqual(res.body.length, 0, 'json should receive empty array')
})

test.failing('Return the alias sets that exist in the DB', async (t) => {
  await AliasSet.create(aliases)
  const res = await request(server).get('/api/tagUI/allAliases').expect(200).expect('Content-Type', /json/)

  t.deepEqual(res.body.length, 3, 'json should receive tag list')
  t.deepEqual(res.body[0].tag, 'coding')
  t.deepEqual(res.body[1].tag, 'development')
  t.deepEqual(res.body[2].tag, 'programming')
})

test.failing('Get all aliases for an existing tag', async (t) => {
  await AliasSet.create(aliases)
  const res = await request(server).get('/api/tagUI/getAliases/coding').expect(200).expect('Content-Type', /json/)

  t.truthy(res.body.aliases.includes('development'))
  t.false(res.body.aliases.includes('coding'))
})

test.failing('Getting aliases for a non-existing tag returns 404', async (t) => {
  await AliasSet.create(aliases)
  const res = await request(server).get('/api/tagUI/getAliases/nonexistingTag')

  t.is(res.status, 404)
})

test.failing('Deleting a tag', async (t) => {
  await AliasSet.create(aliases)
  await request(server).get('/api/tagUI/getAliases/programming').expect(200).expect('Content-Type', /json/)
  await request(server).delete('/api/tagUI/deleteTag/programming').set('Cookie', [`idToken=${jwtAdmin.idToken}`]).expect(200)

  // The deleted tag does not exist in the alias collection
  await request(server).get('/api/tagUI/getAliases/programming').expect(404)

  // The deleted tag is removed from aliases of other tags
  const res1 = await request(server).get('/api/tagUI/getAliases/coding')
  t.false(res1.body.aliases.includes('programming'))
  const res2 = await request(server).get('/api/tagUI/getAliases/development')
  t.false(res2.body.aliases.includes('programming'))
})

test.failing('Deleting a tag, non-admin request', async (t) => {
  await AliasSet.create(aliases)
  await request(server).get('/api/tagUI/getAliases/programming').expect(200).expect('Content-Type', /json/)

  await request(server).delete('/api/tagUI/deleteTag/programming').expect(403)

  // The tag requested for deletion is NOT removed from aliases of other tags
  const res1 = await request(server).get('/api/tagUI/getAliases/coding')
  t.true(res1.body.aliases.includes('programming'))
  const res2 = await request(server).get('/api/tagUI/getAliases/development')
  t.true(res2.body.aliases.includes('programming'))
})
