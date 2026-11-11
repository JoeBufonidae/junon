jest.mock('../../server/entities/team', () => ({
  MemberRoleType: 0,
  AdminRoleType: 1,
  SlaveRoleType: 2,
}))

const Item = require('../../server/entities/item')
const VendingMachine = require('../../server/entities/buildings/vending_machine')
const Constants = require('../../common/constants.json')

describe('Item persisted identity', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('preserves a saved stock ID so custom prices survive cleanup', () => {
    const savedId = 12345
    const entities = {}
    const game = {
      timestamp: Constants.physicsTimeStep,
      generateEntityId: jest.fn(() => 1),
      registerEntity: jest.fn((entity) => {
        entities[entity.id] = entity
      }),
      getEntity: (id) => entities[id],
    }

    jest.spyOn(Item.prototype, 'initMaterializable').mockImplementation(() => {})
    const item = new Item({ game }, 1, { id: savedId })
    const machine = Object.create(VendingMachine.prototype)
    machine.game = game
    machine.storage = { 0: item }
    machine.prices = { [savedId]: 25 }
    machine.onStateChanged = jest.fn()

    expect(item.id).toBe(savedId)
    expect(game.generateEntityId).not.toHaveBeenCalled()
    expect(game.registerEntity).toHaveBeenCalledWith(item)

    machine.executeTurn()

    expect(machine.prices).toEqual({ [savedId]: 25 })
    expect(machine.onStateChanged).not.toHaveBeenCalled()
  })
})
