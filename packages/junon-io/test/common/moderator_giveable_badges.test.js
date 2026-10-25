const Badges = require('../../server/entities/badges')
const ModeratorGiveableBadges = require('junon-common/moderator_giveable_badges')

test('moderator-giveable badge entries are registered badges', () => {
  const registeredIds = Object.values(Badges.badges).map((Badge) => new Badge().getId())

  for (const badge of ModeratorGiveableBadges) {
    expect(registeredIds).toContain(badge.id)
  }
})

test('the YouTube badge is not automatically qualified', () => {
  const Youtube = Badges.badges.Youtube

  expect(new Youtube().isQualified({})).toBe(false)
})
