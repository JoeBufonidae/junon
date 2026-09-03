const BaseBuilding = require("./base_building")
const Protocol = require("../../../../common/util/protocol")

class CircuitBoardPrinter extends BaseBuilding {
  constructor(game, data, isEquipDisplay) {
    super(game, data, isEquipDisplay)
    this.slotCount = 3
  }

  getType() {
    return Protocol.definition().BuildingType.CircuitBoardPrinter
  }

  getSpritePath() {
    return "circuit_board_printer.png"
  }

  getConstantsTable() {
    return "Buildings.CircuitBoardPrinter"
  }

  openMenu() {
    let options = {}

    this.game.processorMenu.open(
      "Circuit Board Printer",
      this,
      this.getMenuDescription(),
      false,
      "",
      options
    )
  }
}

module.exports = CircuitBoardPrinter