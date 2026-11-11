const BaseMenu = require('../../client/src/menus/base_menu')
const SocketUtil = require('../../client/src/util/socket_util')
const Constants = require('../../common/constants.json')

describe('player inventory double-click', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('sends an auto-store request to the open storage menu', () => {
    const menu = Object.create(BaseMenu.prototype)
    menu.game = {
      main: { isMobile: false },
      isDragging: false
    }
    menu.storageId = 20
    const slot = { dataset: { index: '4', type: '1' } }
    const event = {
      target: { closest: () => slot },
      preventDefault: jest.fn()
    }
    const emit = jest.spyOn(SocketUtil, 'emit').mockImplementation(() => {})

    menu.onPlayerInventoryDblClick(event)

    expect(emit).toHaveBeenCalledWith("SwapInventory", {
      sourceStorageId: Constants.inventoryStorageId,
      sourceIndex: '4',
      destinationStorageId: 20
    })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  test('ignores empty inventory slots', () => {
    const menu = Object.create(BaseMenu.prototype)
    menu.game = {
      main: { isMobile: false },
      isDragging: false
    }
    menu.storageId = 20
    const emit = jest.spyOn(SocketUtil, 'emit').mockImplementation(() => {})

    menu.onPlayerInventoryDblClick({
      target: { closest: () => ({ dataset: { index: '4' } }) },
      preventDefault: jest.fn()
    })

    expect(emit).not.toHaveBeenCalled()
  })
})
