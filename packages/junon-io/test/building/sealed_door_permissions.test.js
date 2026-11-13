const Airlock = require('../../server/entities/buildings/airlock')
const BaseBuilding = require('../../server/entities/buildings/base_building')
const SealedDoor = require('../../server/entities/buildings/sealed_door')

describe('sealed door role permissions', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('always keeps custom permissions enabled', () => {
    const door = Object.create(SealedDoor.prototype)
    door.onStateChanged = jest.fn()
    const setCustomAccess = jest.spyOn(BaseBuilding.prototype, 'setIsCustomAccess')

    door.setIsCustomAccess(false)

    expect(setCustomAccess).toHaveBeenCalledWith(true)
    expect(door.isCustomAccess).toBe(true)
  })

  test('uses the owner player team roles for its initial access mask', () => {
    const door = Object.create(SealedDoor.prototype)
    const team = {
      isTeam: () => true,
      roles: { 0: {}, 1: {}, 2: {}, 4: {} }
    }
    door.owner = {
      isTeam: () => false,
      getTeam: () => team
    }

    expect(door.getDefaultAccessType()).toBe((1 << 0) + (1 << 1) + (1 << 2) + (1 << 3) + (1 << 4))
  })

  test('does not inherit another sealed door custom mask on placement', () => {
    const door = Object.create(SealedDoor.prototype)

    expect(door.shouldInheritCustomAccess()).toBe(false)
  })

  test('denies opening when the player role is unchecked', () => {
    const door = Object.create(SealedDoor.prototype)
    jest.spyOn(Airlock.prototype, 'interact').mockImplementation(() => {})
    const player = {
      isPlayer: () => true,
      roleType: 1,
      showError: jest.fn()
    }
    door.isOwnedBy = () => true
    door.accessType = 1 << 2

    door.interact(player)

    expect(player.showError).toHaveBeenCalledWith('Access Denied')
    expect(Airlock.prototype.interact).not.toHaveBeenCalled()
  })

  test('opens when the player role is checked', () => {
    const door = Object.create(SealedDoor.prototype)
    const airlockInteract = jest.spyOn(Airlock.prototype, 'interact').mockImplementation(() => {})
    const player = { isPlayer: () => true, roleType: 1 }
    door.isOwnedBy = () => true
    door.accessType = 1 << player.roleType

    door.interact(player)
    expect(airlockInteract).toHaveBeenCalledWith(player)
  })

  test('preserves an explicitly empty access mask when applying saved data', () => {
    const building = Object.create(BaseBuilding.prototype)
    building.normalizeAngle = angle => angle
    building.sector = { hasInfinitePower: () => false }
    building.hasBuildProgress = () => false
    building.getDefaultTargets = () => undefined
    building.getDefaultAccessType = jest.fn(() => 14)

    building.applyData({ accessType: 0 })

    expect(building.accessType).toBe(0)
    expect(building.getDefaultAccessType).not.toHaveBeenCalled()
  })

  test('allows anyone through an open sealed door regardless of role', () => {
    const door = Object.create(SealedDoor.prototype)
    const entity = {}
    door.isOpen = true
    door.isAllowedToPass = jest.fn(() => false)

    expect(door.shouldObstruct({ entity }, {})).toBe(false)
    expect(door.isAllowedToPass).not.toHaveBeenCalled()
  })

  test('blocks everyone while the sealed door is closed', () => {
    const door = Object.create(SealedDoor.prototype)
    door.isOpen = false
    door.isAllowedToPass = jest.fn(() => true)

    expect(door.shouldObstruct({ entity: {} }, {})).toBe(true)
    expect(door.isAllowedToPass).not.toHaveBeenCalled()
  })
})
