import test from 'node:test'
import assert from 'node:assert/strict'
import { getMarsFieldGuideTopic, marsFieldGuideTopics } from '../src/game/marsFieldGuide.js'

test('Mars field guide contains nine complete, uniquely identified topics', () => {
  assert.equal(marsFieldGuideTopics.length, 9)
  assert.equal(new Set(marsFieldGuideTopics.map((topic) => topic.id)).size, marsFieldGuideTopics.length)

  marsFieldGuideTopics.forEach((topic) => {
    assert.ok(topic.label)
    assert.ok(topic.title)
    assert.ok(topic.summary.length > 80)
    assert.equal(topic.facts.length, 3)
    assert.ok(topic.colonyNote.length > 50)
    assert.ok(topic.sources.length >= 1)
    topic.sources.forEach((source) => assert.match(source.url, /^https:\/\//))
  })
})

test('Mars field guide lookup returns a topic and safely falls back', () => {
  assert.equal(getMarsFieldGuideTopic('water-ice').label, 'Water ice')
  assert.equal(getMarsFieldGuideTopic('unknown').id, marsFieldGuideTopics[0].id)
})
