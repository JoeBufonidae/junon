const BaseMob = require("../../server/entities/mobs/base_mob")

function createPlayer(id, isVisible) {
const player = {
id,
visibleMobs: {},
calculateEntityVisible: jest.fn(() => isVisible),
addVisibleMob: jest.fn(function(mob) {
this.visibleMobs[mob.getId()] = mob
mob.addPlayerViewership(this)
}),
removeVisibleMob: jest.fn(function(mob) {
delete this.visibleMobs[mob.getId()]
mob.removePlayerViewership(this)
}),
getId() {
return this.id
}
}
return player
}

function createMob(playersInRange = []) {
const mob = Object.create(BaseMob.prototype)
mob.id = "mob-1"
mob.playerViewerships = {}
mob.getId = () => mob.id
mob.getTypeName = () => "test-mob"
mob.getRow = () => 0
mob.getCol = () => 0
mob.getNeighborBoundingBox = jest.fn(() => ({ minX: 0, minY: 0, maxX: 10, maxY: 10 }))
mob.sector = {
playerTree: { search: jest.fn(() => playersInRange) },
isFovMode: jest.fn(() => true)
}
mob.trackRegions = jest.fn()
mob.game = { triggerEvent: jest.fn() }
return mob
}

describe("BaseMob FOV visibility updates", () => {
test("registers a stationary player when the mob moves into visibility", () => {
const player = createPlayer("player-1", true)
const mob = createMob([player])
mob.onGridPositionChanged()
expect(player.addVisibleMob).toHaveBeenCalledWith(mob)
expect(mob.playerViewerships[player.getId()]).toBe(player)
})

test("removes a player when the mob moves out of visibility", () => {
const player = createPlayer("player-1", false)
const mob = createMob()
mob.playerViewerships[player.getId()] = player
player.visibleMobs[mob.getId()] = mob
mob.onGridPositionChanged()
expect(player.removeVisibleMob).toHaveBeenCalledWith(mob)
expect(mob.playerViewerships[player.getId()]).toBeUndefined()
})

test("does not register an already-visible player a second time", () => {
const player = createPlayer("player-1", true)
const mob = createMob([player])
mob.playerViewerships[player.getId()] = player
player.visibleMobs[mob.getId()] = mob
mob.onGridPositionChanged()
expect(player.addVisibleMob).not.toHaveBeenCalled()
expect(mob.playerViewerships[player.getId()]).toBe(player)
})

test("does not refresh FOV visibility outside FOV mode", () => {
const player = createPlayer("player-1", true)
const mob = createMob([player])
mob.sector.isFovMode.mockReturnValue(false)
mob.onGridPositionChanged()
expect(mob.sector.playerTree.search).not.toHaveBeenCalled()
expect(player.addVisibleMob).not.toHaveBeenCalled()
})
})
