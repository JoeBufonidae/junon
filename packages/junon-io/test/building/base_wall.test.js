const BaseWall = require('../../client/src/entities/buildings/base_wall')
const Airlock = require('../../client/src/entities/buildings/airlock')
const BaseBuilding = require('../../client/src/entities/buildings/base_building')

describe('wall door neighbors', () => {
  test('connects to doors in adjacent structure tiles without losing wall connections', () => {
    const door = { hasCategory: (category) => category === 'door' }
    const nonDoor = { hasCategory: (category) => category === 'door' ? false : true }
    const neighbors = [
      { entity: door },
      { entity: nonDoor },
      { entity: null },
      { entity: null },
      { entity: null },
      { entity: door },
      { entity: null },
      { entity: null },
    ]
    const wall = Object.assign(Object.create(BaseWall.prototype), {
      neighbors: 1 << 3,
      getRow: () => 4,
      getCol: () => 6,
      container: {
        structureMap: {
          getNeighborsAllowEmpty: jest.fn(() => neighbors)
        }
      }
    })

    const tiles = wall.convertNeighborsToSideHits(wall.neighbors)

    expect(wall.container.structureMap.getNeighborsAllowEmpty).toHaveBeenCalledWith(4, 6, true)
    expect(tiles).toEqual({
      left: true,
      up: false,
      right: false,
      down: false,
      topleft: false,
      topright: true,
      bottomleft: false,
      bottomright: false
    })
  })

  test('redraws adjacent wall sprites', () => {
    const wall = {
      hasCategory: (category) => category === 'wall',
      redrawSprite: jest.fn()
    }
    const getNeighborTiles = jest.fn(() => [{ entity: wall }, { entity: null }])
    const door = Object.assign(Object.create(Airlock.prototype), {
      container: { armorMap: {} },
      getRelativeBox: () => ({ pos: { x: 0, y: 0 }, w: 128, h: 32 })
    })
    door.constructor = { getNeighborTiles }

    door.redrawNeighborWalls()

    expect(getNeighborTiles).toHaveBeenCalledWith(
      door.container.armorMap,
      door.getRelativeBox()
    )
    expect(wall.redrawSprite).toHaveBeenCalledTimes(1)
  })

  test('refreshes nearby walls after a door is added or removed', () => {
    const door = Object.assign(Object.create(Airlock.prototype), {
      register: jest.fn(),
      redrawNeighborWalls: jest.fn()
    })

    door.onBuildingConstructed()
    expect(door.redrawNeighborWalls).toHaveBeenCalledTimes(1)

    const removeBuilding = jest.spyOn(BaseBuilding.prototype, 'remove').mockImplementation(() => {})
    door.remove()

    expect(removeBuilding).toHaveBeenCalledTimes(1)
    expect(door.redrawNeighborWalls).toHaveBeenCalledTimes(2)
    removeBuilding.mockRestore()
  })
})
