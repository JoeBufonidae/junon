jest.mock('../../server/entities/team', () => ({
  MemberRoleType: 0,
  AdminRoleType: 1,
  SlaveRoleType: 2,
}))

const ClientAirlock = require('../../client/src/entities/buildings/airlock')
const ClientVentilator = require('../../client/src/entities/buildings/ventilator')
const ServerAirlock = require('../../server/entities/buildings/airlock')
const ServerVentilator = require('../../server/entities/buildings/ventilator')

describe.each([
  ['client airlock', ClientAirlock],
  ['client ventilator', ClientVentilator],
  ['server airlock', ServerAirlock],
  ['server ventilator', ServerVentilator],
])('%s placement', (_name, Building) => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('is invalid when placed on a wall', () => {
    jest.spyOn(Building, 'getSideTiles').mockReturnValue([])
    const wall = {
      hasCategory: (category) => category === 'wall',
    }
    const container = {
      armorMap: {
        hitTestTile: () => [{ entity: wall }],
      },
    }

    expect(Building.isPositionValid(container, 0, 0, 32, 32, 0, {})).toBe(false)
  })
})
