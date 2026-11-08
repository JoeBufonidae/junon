jest.mock('../../server/entities/team', () => ({
  MemberRoleType: 0,
  AdminRoleType: 1,
  SlaveRoleType: 2
}))

const Player = require('../../server/entities/player')

describe('throwAllInventory', () => {
  test('drops the equipped suit as well as inventory items', () => {
    const inventoryItem = {}
    const suitItem = {}
    const player = Object.create(Player.prototype)
    player.inventory = {
      forEachItem: (callback) => callback(inventoryItem),
      removeItem: jest.fn()
    }
    player.retrieveArmorItem = jest.fn(() => suitItem)
    player.throwInventory = jest.fn()

    player.throwAllInventory()

    expect(player.inventory.removeItem).toHaveBeenCalledWith(inventoryItem)
    expect(player.retrieveArmorItem).toHaveBeenCalledTimes(1)
    expect(player.throwInventory.mock.calls).toEqual([[inventoryItem], [suitItem]])
  })

  test('does not throw armor when no suit is equipped', () => {
    const player = Object.create(Player.prototype)
    player.inventory = { forEachItem: jest.fn() }
    player.retrieveArmorItem = jest.fn(() => null)
    player.throwInventory = jest.fn()

    player.throwAllInventory()

    expect(player.throwInventory).not.toHaveBeenCalled()
  })
})
