const Player = require('../../server/entities/player')
const Buildings = require('../../server/entities/buildings')

function createBuildingClass(typeName, categories = {}) {
  class TestBuilding {
    static getType() {
      return 1
    }

    static getRotatedWidth() {
      return 32
    }

    static getRotatedHeight() {
      return 32
    }

    static isPositionValid() {
      return false
    }
  }

  TestBuilding.prototype.getTypeName = () => typeName
  TestBuilding.prototype.getRotatedWidth = () => 32
  TestBuilding.prototype.getRotatedHeight = () => 32
  TestBuilding.prototype.isCoordValid = () => true
  TestBuilding.prototype.hasCategory = (category) => !!categories[category]
  TestBuilding.prototype.isCrop = () => false

  return TestBuilding
}

function createPlayer(permissions) {
  const player = Object.create(Player.prototype)
  player.game = { getEntity: () => ({}) }
  player.inventory = { search: () => ({}) }
  player.isControllingPlayer = () => true
  player.isBuildingAllowedInGame = () => true
  player.getTeam = () => ({ isBuildLimitReached: () => false })
  player.getRole = () => ({
    isAllowedTo: (permission) => !!permissions[permission]
  })
  player.getRegionBuildPermission = () => null
  player.showError = jest.fn()

  return player
}

describe('role-specific building permissions', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('requires BuildKeypadStructures for safes and keypad doors', () => {
    const Safe = createBuildingClass('Safe')
    jest.spyOn(Buildings, 'forType').mockReturnValue(Safe)
    const player = createPlayer({ Build: true })

    expect(player.build({ containerId: 1, type: 1, x: 0, y: 0 })).toBeNull()
    expect(player.showError).toHaveBeenCalledWith(
      'You dont have permission to build keypad structures'
    )
  })

  test('still requires Build as well as BuildKeypadStructures', () => {
    const KeypadDoor = createBuildingClass('KeypadDoor')
    jest.spyOn(Buildings, 'forType').mockReturnValue(KeypadDoor)
    const player = createPlayer({ BuildKeypadStructures: true })

    expect(player.build({ containerId: 1, type: 1, x: 0, y: 0 })).toBeNull()
    expect(player.showError).toHaveBeenCalledWith("You dont have building permissions")
  })

  test('requires SellToPlayers for vending machines and dispensers', () => {
    const Dispenser = createBuildingClass('Dispenser', { vending_machine: true })
    jest.spyOn(Buildings, 'forType').mockReturnValue(Dispenser)
    const player = createPlayer({ Build: true })

    expect(player.build({ containerId: 1, type: 1, x: 0, y: 0 })).toBeNull()
    expect(player.showError).toHaveBeenCalledWith(
      'You dont have permission to build vending machines'
    )
  })

  test('still requires Build as well as SellToPlayers', () => {
    const VendingMachine = createBuildingClass('FoodVendingMachine', { vending_machine: true })
    jest.spyOn(Buildings, 'forType').mockReturnValue(VendingMachine)
    const player = createPlayer({ SellToPlayers: true })

    expect(player.build({ containerId: 1, type: 1, x: 0, y: 0 })).toBeNull()
    expect(player.showError).toHaveBeenCalledWith("You dont have building permissions")
  })
})
