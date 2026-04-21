import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseCompareParam,
  serializeCompareState,
  MAX_TABS,
  MAX_SLOTS_PER_TAB,
} from '../url-state'

const UUID_A = '11111111-1111-4111-8111-111111111111'
const UUID_B = '22222222-2222-4222-8222-222222222222'
const UUID_C = '33333333-3333-4333-8333-333333333333'
const UUID_D = '44444444-4444-4444-8444-444444444444'
const UUID_E = '55555555-5555-4555-8555-555555555555'
const UUID_F = '66666666-6666-4666-8666-666666666666'
const UUID_G = '77777777-7777-4777-8777-777777777777'

test('parse: null/empty returns single empty tab', () => {
  assert.deepEqual(parseCompareParam(null), { tabs: [{ roleIds: [] }] })
  assert.deepEqual(parseCompareParam(''), { tabs: [{ roleIds: [] }] })
  assert.deepEqual(parseCompareParam(undefined), { tabs: [{ roleIds: [] }] })
})

test('parse: single-tab three roles', () => {
  const s = parseCompareParam(`${UUID_A},${UUID_B},${UUID_C}`)
  assert.deepEqual(s.tabs.length, 1)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A, UUID_B, UUID_C])
})

test('parse: two tabs with pipe', () => {
  const s = parseCompareParam(`${UUID_A},${UUID_B}|${UUID_C},${UUID_D}`)
  assert.equal(s.tabs.length, 2)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A, UUID_B])
  assert.deepEqual(s.tabs[1].roleIds, [UUID_C, UUID_D])
})

test('parse: drops non-UUID tokens', () => {
  const s = parseCompareParam(`${UUID_A},notauuid,${UUID_B}`)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A, UUID_B])
})

test('parse: caps at MAX_TABS', () => {
  const raw = [UUID_A, UUID_B, UUID_C, UUID_D].map((u) => u).join('|')
  const s = parseCompareParam(raw)
  assert.equal(s.tabs.length, MAX_TABS)
})

test('parse: caps slots per tab at MAX_SLOTS_PER_TAB', () => {
  const s = parseCompareParam(
    `${UUID_A},${UUID_B},${UUID_C},${UUID_D},${UUID_E}`,
  )
  assert.equal(s.tabs[0].roleIds.length, MAX_SLOTS_PER_TAB)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A, UUID_B, UUID_C])
})

test('parse: dedupes within a tab, case-insensitive', () => {
  const upper = UUID_A.toUpperCase()
  const s = parseCompareParam(`${UUID_A},${upper},${UUID_B}`)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A, UUID_B])
})

test('parse: empty tab segment is preserved as an empty tab', () => {
  const s = parseCompareParam(`${UUID_A}||${UUID_B}`)
  assert.equal(s.tabs.length, 3)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A])
  assert.deepEqual(s.tabs[1].roleIds, [])
  assert.deepEqual(s.tabs[2].roleIds, [UUID_B])
})

test('parse: handles whitespace around tokens', () => {
  const s = parseCompareParam(` ${UUID_A} , ${UUID_B} `)
  assert.deepEqual(s.tabs[0].roleIds, [UUID_A, UUID_B])
})

test('serialize: empty state returns null', () => {
  assert.equal(serializeCompareState({ tabs: [{ roleIds: [] }] }), null)
  assert.equal(serializeCompareState({ tabs: [] }), null)
})

test('serialize: single tab', () => {
  assert.equal(
    serializeCompareState({ tabs: [{ roleIds: [UUID_A, UUID_B] }] }),
    `${UUID_A},${UUID_B}`,
  )
})

test('serialize: multiple tabs separated by pipe', () => {
  assert.equal(
    serializeCompareState({
      tabs: [
        { roleIds: [UUID_A, UUID_B] },
        { roleIds: [UUID_C] },
        { roleIds: [UUID_D, UUID_E, UUID_F] },
      ],
    }),
    `${UUID_A},${UUID_B}|${UUID_C}|${UUID_D},${UUID_E},${UUID_F}`,
  )
})

test('serialize: caps tabs and slots', () => {
  const out = serializeCompareState({
    tabs: [
      { roleIds: [UUID_A, UUID_B, UUID_C, UUID_D] },
      { roleIds: [UUID_E] },
      { roleIds: [UUID_F] },
      { roleIds: [UUID_G] },
    ],
  })
  assert.ok(out)
  assert.equal(out!.split('|').length, MAX_TABS)
  assert.equal(out!.split('|')[0].split(',').length, MAX_SLOTS_PER_TAB)
})

test('round-trip: parse(serialize(x)) preserves', () => {
  const state = {
    tabs: [
      { roleIds: [UUID_A, UUID_B, UUID_C] },
      { roleIds: [UUID_D] },
    ],
  }
  const round = parseCompareParam(serializeCompareState(state))
  assert.deepEqual(round, state)
})

test('round-trip: empty-middle tab preserved', () => {
  const state = {
    tabs: [{ roleIds: [UUID_A] }, { roleIds: [] }, { roleIds: [UUID_B] }],
  }
  const round = parseCompareParam(serializeCompareState(state))
  assert.deepEqual(round, state)
})
