const BaseMenu = require("../../client/src/menus/base_menu")

describe("BaseMenu storage updates", () => {
  let menu
  let slot

  beforeEach(() => {
    slot = {
      className: "inventory_slot",
      dataset: {
        index: "0",
        id: "",
        type: "",
        content: "",
        special: "",
        usage: "",
        lastUsedTimestamp: ""
      }
    }

    const storage = {
      querySelectorAll: () => [slot]
    }
    menu = Object.create(BaseMenu.prototype)
    menu.el = { querySelector: () => storage }
    menu.game = {
      renderInventorySlot: jest.fn((inventorySlot, item) => {
        inventorySlot.dataset.id = String(item.id || "")
        inventorySlot.dataset.type = String(item.type)
        inventorySlot.dataset.content = String(item.count === 1 ? "" : item.count)
        inventorySlot.dataset.special = String((item.instance && item.instance.content) || "")
        inventorySlot.dataset.usage = String((item.instance && item.instance.usage) || "")
        inventorySlot.dataset.lastUsedTimestamp = String(item.lastUsedTimestamp || "")
      }),
      resetInventorySlot: jest.fn((inventorySlot) => {
        inventorySlot.dataset.id = ""
        inventorySlot.dataset.type = ""
        inventorySlot.dataset.content = ""
        inventorySlot.dataset.special = ""
        inventorySlot.dataset.usage = ""
        inventorySlot.dataset.lastUsedTimestamp = ""
      })
    }
  })

  it("does not repaint unchanged items on repeated storage snapshots", () => {
    const item = { id: 12, index: 0, type: 4, count: 1 }
    const update = () => menu.updateStorageInventory({
      id: 20,
      inventory: { storage: [item] }
    })

    update()
    update()

    expect(menu.game.renderInventorySlot).toHaveBeenCalledTimes(1)
    expect(menu.game.resetInventorySlot).not.toHaveBeenCalled()
  })

  it("updates changed items and clears slots that become empty", () => {
    const item = { id: 12, index: 0, type: 4, count: 1 }
    menu.updateStorageInventory({ id: 20, inventory: { storage: [item] } })
    menu.updateStorageInventory({
      id: 20,
      inventory: { storage: [{ ...item, count: 2 }] }
    })
    menu.updateStorageInventory({ id: 20, inventory: { storage: [] } })

    expect(menu.game.renderInventorySlot).toHaveBeenCalledTimes(2)
    expect(menu.game.resetInventorySlot).toHaveBeenCalledTimes(1)
  })
})
