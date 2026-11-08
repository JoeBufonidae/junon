jest.mock('../../server/entities/team', () => ({
  MemberRoleType: 0,
  AdminRoleType: 1,
  SlaveRoleType: 2
}))

const Player = require('../../server/entities/player')

function createPlayer(storage) {
  const player = Object.create(Player.prototype)
  player.getOccupiedRoom = jest.fn(() => null)
  player.hasOwnership = jest.fn(() => false)
  player.showError = jest.fn()
  player.socket = {}
  player.getSocketUtil = () => ({ emit: jest.fn() })
  player.game = { getEntity: () => storage }
  return player
}

describe('viewStorage', () => {
  test.each(['VendingMachine', 'Dispenser'])(
    'allows a non-owner to open a %s buy menu',
    (typeName) => {
      const storage = {
        typeName,
        hasCategory: (category) => category === 'vending_machine',
        hasOwner: () => true,
        isReachableFromRoom: () => true,
        addViewSubscriber: jest.fn()
      }
      const player = createPlayer(storage)

      player.viewStorage({ id: 'vendor-id' })

      expect(storage.addViewSubscriber).toHaveBeenCalledWith(player)
      expect(player.showError).not.toHaveBeenCalled()
    }
  )

  test('continues to restrict access to other owned storage', () => {
    const storage = {
      hasCategory: () => false,
      hasOwner: () => true,
      isReachableFromRoom: () => true,
      addViewSubscriber: jest.fn()
    }
    const player = createPlayer(storage)

    player.viewStorage({ id: 'storage-id' })

    expect(storage.addViewSubscriber).not.toHaveBeenCalled()
    expect(player.showError).toHaveBeenCalledWith("That doesnt belong to you")
  })
})
