const BaseBuilding = require("./base_building")
const Protocol = require("./../../../../common/util/protocol")

class SuitWorkstation extends BaseBuilding {
  constructor(game, data, isEquipDisplay) {
    super(game, data, isEquipDisplay)
    this.slotCount = 3
  }

  getType() {
    return Protocol.definition().BuildingType.SuitWorkstation
  }

  getSpritePath() {
    return "suit_workstation.png"
  }

  getConstantsTable() {
    return "Buildings.SuitWorkstation"
  }

  openMenu() {
    let options = {}
    this.game.processorMenu.open(
      "Suit Workstation",
      this,
      this.getMenuDescription(),
      false,
      "",
      options
    )
  }

  onPostEquip() {
    // Listen for alteration success
    this.game.socketUtil.on("SuitAlterationSuccess", (data) => {
      if (data.armorId) {
        this.game.showNotification("Suit alteration successful!")
        // Optionally update local armor data
      }
    })
  }
}

module.exports = SuitWorkstation