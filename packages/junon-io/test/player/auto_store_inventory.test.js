jest.mock('../../server/entities/team', () => ({
  MemberRoleType: 0,
  AdminRoleType: 1,
  SlaveRoleType: 2
}))

const Player = require('../../server/entities/player')

function createPlayer(item, storageItems, canStore) {
  const sourceStorage = {
    get: (index) => index === 0 ? item : null,
    getStorageLength: () => 36,
    isInventory: () => true
  }
  const destinationStorage = {
    id: 20,
    get: (index) => storageItems[index] || null,
    getStorageLength: () => storageItems.length,
    isBuildingStorage: () => true,
    isInventory: () => false,
    isSector: () => false,
    canStoreAt: () => true,
    canStore
  }

  const player = Object.create(Player.prototype)
  player.getStorage = (id) => id === 1 ? sourceStorage : destinationStorage
  player.getActiveItem = () => ({})
  player.getSocketUtil = () => ({ emit: jest.fn() })
  player.getNonInventoryStorage = () => destinationStorage
  player.performItemSwap = jest.fn()
  player.removeHandEquipment = jest.fn()
  player.showError = jest.fn()
  player.sector = { shouldAllowSuitChanged: () => false }

  return { player, sourceStorage, destinationStorage }
}

describe('double-click auto-store', () => {
  test('selects the accepted processor input slot and skips output slots', () => {
    const copperBar = {
      type: 1,
      isStackableType: () => true,
      isFullyStacked: () => false
    }
    const { player, sourceStorage, destinationStorage } = createPlayer(
      copperBar,
      [null, null, null],
      (index, item) => (index === 0 && item.type === 1) ||
        (index === 1 && item.type === 2)
    )

    player.swapInventory({
      sourceStorageId: 1,
      sourceIndex: 0,
      destinationStorageId: destinationStorage.id
    })

    expect(player.performItemSwap).toHaveBeenCalledWith(
      sourceStorage,
      destinationStorage,
      0,
      0
    )
    expect(player.showError).not.toHaveBeenCalled()
  })

  test('prefers a compatible stack over an empty input slot', () => {
    const wood = {
      type: 3,
      isStackableType: () => true,
      isFullyStacked: () => false
    }
    const existingWood = {
      type: 3,
      isStackableType: () => true,
      isFullyStacked: () => false
    }
    const { player, sourceStorage, destinationStorage } = createPlayer(
      wood,
      [existingWood, null],
      () => true
    )

    player.swapInventory({
      sourceStorageId: 1,
      sourceIndex: 0,
      destinationStorageId: destinationStorage.id
    })

    expect(player.performItemSwap).toHaveBeenCalledWith(
      sourceStorage,
      destinationStorage,
      0,
      0
    )
  })

  test('rejects items that have no accepted input slot', () => {
    const item = {
      type: 4,
      isStackableType: () => true,
      isFullyStacked: () => false
    }
    const { player, destinationStorage } = createPlayer(item, [null, null, null], () => false)

    player.swapInventory({
      sourceStorageId: 1,
      sourceIndex: 0,
      destinationStorageId: destinationStorage.id
    })

    expect(player.showError).toHaveBeenCalledWith("Invalid Item")
    expect(player.performItemSwap).not.toHaveBeenCalled()
  })
})
