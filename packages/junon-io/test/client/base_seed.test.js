const BaseSeed = require('../../client/src/entities/buildings/crops/base_seed')

describe('BaseSeed carried by a user', () => {
  test.each([
    ['a mob', { isMob: () => true }],
    ['a player', { isMob: () => false }],
  ])('hides the seed sprite for %s', (userType, user) => {
    const seed = Object.create(BaseSeed.prototype)
    seed.data = { user }
    seed.sprite = { visible: true }

    seed.onPostEquip()

    expect(seed.sprite.visible).toBe(false)
  })

  test('renders in the user hand equipment container', () => {
    const handEquipContainer = {}
    const seed = Object.create(BaseSeed.prototype)
    seed.data = { user: { handEquipContainer } }
    seed.getConstants = () => ({})

    expect(seed.getSpriteContainer()).toBe(handEquipContainer)
  })
})
