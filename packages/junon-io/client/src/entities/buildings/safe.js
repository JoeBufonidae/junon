const BaseBuilding = require("./base_building")
const Protocol = require("./../../../../common/util/protocol")

class Safe extends BaseBuilding {
    openMenu() {
      this.game.keypadMenu.open(this.id)
    }

    getType() {
      return Protocol.definition().BuildingType.Safe
    }

    getSpritePath() {
      return "safe.png"
    }

    getConstantsTable() {
      return "Buildings.Safe"
    }
}

module.exports = Safe
