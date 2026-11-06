const Airlock = require('../../server/entities/buildings/airlock')

let nextDoorId = 1

function createRoom(isAirtight) {
  const room = {
    id: `room-${Math.random()}`,
    doors: {},
    isAirtight: () => isAirtight,
    getDoors() {
      return Object.values(this.doors)
    }
  }

  return room
}

function connectRooms(rooms, { isOpen = true, hasVacuum = false } = {}) {
  const door = {
    id: nextDoorId++,
    isOpen,
    rooms: {},
    getVacuumTiles() {
      return isOpen && hasVacuum ? [{ entity: 0 }] : []
    }
  }

  rooms.forEach((room) => {
    door.rooms[room.id] = room
    room.doors[door.id] = { entity: door }
  })

  return door
}

function getVacuumTiles({ isOpen = true, negativeSide = [], positiveSide = [] }, room) {
  const sideHits = { '-1': negativeSide, '1': positiveSide }
  const connectedRooms = [...negativeSide, ...positiveSide]
    .filter((hit) => hit.entity && hit.entity.room)
    .map((hit) => hit.entity.room)

  const rooms = [...new Set(connectedRooms)]
  const primaryDoor = {
    id: nextDoorId++,
    isOpen,
    rooms: {},
    getDoorSideRelativeBox: (side) => side,
    getPlatformTiles: (side) => sideHits[side],
    getVacuumTiles() {
      return Airlock.prototype.getVacuumTiles.call(this)
    }
  }

  rooms.forEach((connectedRoom) => {
    primaryDoor.rooms[connectedRoom.id] = connectedRoom
    connectedRoom.doors[primaryDoor.id] = { entity: primaryDoor }
  })

  return Airlock.prototype.getVacuumTiles.call(primaryDoor, room)
}

test('an open door exposes an airtight room to an adjacent non-airtight room', () => {
  const airtightRoom = createRoom(true)
  const exposedRoom = createRoom(false)

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: airtightRoom } }],
    positiveSide: [{ entity: { room: exposedRoom } }]
  }, airtightRoom)).toHaveLength(1)
})

test('an open door between two airtight rooms does not expose either room', () => {
  const roomA = createRoom(true)
  const roomB = createRoom(true)

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: roomA } }],
    positiveSide: [{ entity: { room: roomB } }]
  }, roomA)).toHaveLength(0)
})

test('a closed door does not expose an airtight room to a non-airtight room', () => {
  const airtightRoom = createRoom(true)
  const exposedRoom = createRoom(false)

  expect(getVacuumTiles({
    isOpen: false,
    negativeSide: [{ entity: { room: airtightRoom } }],
    positiveSide: [{ entity: { room: exposedRoom } }]
  }, airtightRoom)).toHaveLength(0)
})

test('an open door exposes an airtight room directly to a space tile', () => {
  const airtightRoom = createRoom(true)

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: airtightRoom } }],
    positiveSide: [{ entity: 0 }]
  }, airtightRoom)).toHaveLength(1)
})

test('a room not adjacent to either side of the door is not marked exposed', () => {
  const roomA = createRoom(true)
  const roomB = createRoom(true)
  const unrelatedRoom = createRoom(true)

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: roomA } }],
    positiveSide: [{ entity: { room: roomB } }]
  }, unrelatedRoom)).toHaveLength(0)
})

test('an airtight room is exposed through an airtight buffer room to vacuum', () => {
  const roomA = createRoom(true)
  const bufferRoom = createRoom(true)

  connectRooms([bufferRoom], { hasVacuum: true })

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: roomA } }],
    positiveSide: [{ entity: { room: bufferRoom } }]
  }, roomA)).toHaveLength(1)
})

test('an airtight room is exposed through multiple airtight buffer rooms', () => {
  const roomA = createRoom(true)
  const roomB = createRoom(true)
  const roomC = createRoom(true)

  connectRooms([roomB, roomC])
  connectRooms([roomC], { hasVacuum: true })

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: roomA } }],
    positiveSide: [{ entity: { room: roomB } }]
  }, roomA)).toHaveLength(1)
})

test('a closed door between buffer rooms blocks vacuum propagation', () => {
  const roomA = createRoom(true)
  const bufferRoom = createRoom(true)

  connectRooms([bufferRoom], { isOpen: false, hasVacuum: true })

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: roomA } }],
    positiveSide: [{ entity: { room: bufferRoom } }]
  }, roomA)).toHaveLength(0)
})

test('a cycle of airtight rooms without a vacuum boundary remains sealed', () => {
  const roomA = createRoom(true)
  const roomB = createRoom(true)
  const roomC = createRoom(true)

  connectRooms([roomA, roomB])
  connectRooms([roomB, roomC])
  connectRooms([roomC, roomA])

  expect(getVacuumTiles({
    negativeSide: [{ entity: { room: roomA } }],
    positiveSide: [{ entity: { roomB } }]
  }, roomA)).toHaveLength(0)
})
