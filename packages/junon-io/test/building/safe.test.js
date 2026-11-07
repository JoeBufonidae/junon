const Safe = require("../../server/entities/buildings/safe")
const SpawnItem = require("../../server/commands/spawn_item")

describe("Safe keypad access", () => {
  let safe
  let player
  let emitted

  beforeEach(() => {
    emitted = []
    safe = Object.create(Safe.prototype)
    safe.id = 42
    safe.sector = { keyCodes: { 42: { keyCode: "1234" } } }
    safe.getSocketUtil = () => ({
      emit: (...args) => emitted.push(args)
    })
    player = {
      id: 7,
      getSocket: () => "socket",
      showError: jest.fn()
    }
  })

  test("a correct code grants one storage-open authorization", () => {
    safe.checkKeypadCode(player, { keyCode: "1234" })

    expect(emitted).toEqual([["socket", "KeypadSuccessful", {}]])
    expect(safe.authorizeStorageView(player)).toBe(true)
    expect(safe.authorizeStorageView(player)).toBe(false)
  })

  test("an incorrect code does not authorize storage access", () => {
    safe.checkKeypadCode(player, { keyCode: "wrong" })

    expect(emitted).toEqual([["socket", "KeypadUnsuccessful", {}]])
    expect(safe.authorizeStorageView(player)).toBe(false)
  })
})

describe("Safe registration and spawning", () => {
  test("the client includes Safe in the generated Structures blueprint list", async () => {
    const Protocol = require("../../common/util/protocol")
    const previousI18n = global.i18n
    const previousLanguage = global.isForeignLanguage
    const previousDebugMode = global.debugMode

    try {
      global.debugMode = false
      await new Promise((resolve, reject) => {
        Protocol.initServer(error => error ? reject(error) : resolve())
      })
      global.i18n = { t: value => value }
      global.isForeignLanguage = false

      const Buildings = require("../../client/src/entities/buildings")
      const BlueprintMenu = require("../../client/src/menus/blueprint_menu")
      const menu = Object.create(BlueprintMenu.prototype)
      const markup = menu.getCraftingListContainer()
      const safeType = Protocol.definition().BuildingType.Safe
      const Helper = require("../../common/helper")
      const previousTypeNamesById = Helper.typeNamesById

      try {
        Helper.typeNamesById = {}

        expect(Buildings.Safe).toBe(Buildings.Structures.Safe)
        expect(Buildings.forType(safeType)).toBe(Buildings.Safe)
        expect(() => require("../../client/src/entities/item").getSpritePath(safeType)).not.toThrow()
        expect(markup).toContain(`data-type='${safeType}' data-construction-type='Structures'`)
      } finally {
        Helper.typeNamesById = previousTypeNamesById
      }
    } finally {
      global.i18n = previousI18n
      global.isForeignLanguage = previousLanguage
      global.debugMode = previousDebugMode
    }
  })

  test("the client can render Safe if its cached protocol enum is stale", async () => {
    const Protocol = require("../../common/util/protocol")
    const previousDebugMode = global.debugMode

    try {
      global.debugMode = false
      await new Promise((resolve, reject) => {
        Protocol.initServer(error => error ? reject(error) : resolve())
      })

      const buildingType = Protocol.definition().BuildingType
      const safeType = buildingType.Safe
      delete buildingType.Safe

      try {
        const Item = require("../../client/src/entities/item")
        expect(() => Item.getSpritePath(293)).not.toThrow()
        expect(Item.getSpritePath(293)).toBe("fridge.png")
      } finally {
        buildingType.Safe = safeType
      }
    } finally {
      global.debugMode = previousDebugMode
    }
  })

  test("default spawnitem drops the pickup beyond the player's immediate reach", () => {
    const command = Object.create(SpawnItem.prototype)
    command.sector = { spawnItem: jest.fn() }
    const caller = {
      getRadAngle: () => 0,
      getX: () => 100,
      getY: () => 200
    }

    command.perform(caller, ["Safe"])

    expect(command.sector.spawnItem).toHaveBeenCalledWith({
      player: caller,
      type: "Safe",
      count: null,
      x: 100 + 2 * require("../../common/constants.json").tileSize,
      y: 200
    })
  })
})
