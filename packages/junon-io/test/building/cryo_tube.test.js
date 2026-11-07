const Corpse = require('../../server/entities/corpse')
const CryoTube = require('../../server/entities/buildings/cryo_tube')

describe('CryoTube mutant revival', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('revives a tamed corpse as a mutant without its owner or name', () => {
    const mob = { getMaxHealth: () => 100, setHealth: jest.fn() }
    const corpse = {
      isCorpse: () => true,
      resurrect: jest.fn(() => mob)
    }
    const tube = Object.create(CryoTube.prototype)
    tube.game = { timestamp: 0 }
    tube.sector = { getSetting: () => true }
    tube.getStoredEntity = () => corpse
    tube.removeAt = jest.fn()
    tube.store = jest.fn()
    tube.releaseContent = jest.fn()
    jest.spyOn(Math, 'random').mockReturnValue(0)

    tube.executeTurn()

    expect(corpse.resurrect).toHaveBeenCalledWith('Mutant', null, null)
    expect(mob.setHealth).toHaveBeenCalledWith(100)
    expect(tube.store).toHaveBeenCalledWith(mob)
    expect(tube.releaseContent).toHaveBeenCalled()
  })
})

describe('Corpse.resurrect ownership', () => {
  test('uses an explicit null owner and name for wild revival', () => {
    const mob = {}
    const corpse = Object.create(Corpse.prototype)
    const team = { id: 12 }
    corpse.x = 10
    corpse.y = 20
    corpse.type = 1
    corpse.name = 'Tamed mob'
    corpse.owner = team
    corpse.resurrectCount = 0
    corpse.sector = { spawnMob: jest.fn(() => [mob]) }
    corpse.game = { triggerEvent: jest.fn() }
    corpse.remove = jest.fn()

    corpse.resurrect('Mutant', null, null)

    const revivedData = corpse.sector.spawnMob.mock.calls[0][0]
    expect(revivedData).toEqual(expect.objectContaining({
      type: 'Mutant',
      owner: null,
      name: null
    }))
    expect(revivedData).not.toHaveProperty('master')
  })

  test('keeps the existing owner for ordinary revival', () => {
    const corpse = Object.create(Corpse.prototype)
    const team = { id: 12 }
    corpse.x = 10
    corpse.y = 20
    corpse.type = 1
    corpse.name = 'Tamed mob'
    corpse.owner = team
    corpse.resurrectCount = 0
    corpse.sector = { spawnMob: jest.fn(() => [{}]) }
    corpse.game = { triggerEvent: jest.fn() }
    corpse.remove = jest.fn()

    corpse.resurrect('Slime')

    expect(corpse.sector.spawnMob).toHaveBeenCalledWith(expect.objectContaining({
      owner: team,
      name: 'Tamed mob'
    }))
  })
})
