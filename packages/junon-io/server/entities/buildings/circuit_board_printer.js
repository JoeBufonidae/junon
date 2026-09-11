const BaseProcessor = require("./base_processor")
const Protocol = require("../../../common/util/protocol")
const Bars = require("../bars")
const Constants = require("../../../common/constants")

class CircuitBoardPrinter extends BaseProcessor {
  constructor(container, data) {
    super(container, data)
    this.slotCount = 3
  }

  getConstantsTable() {
    return "Buildings.CircuitBoardPrinter"
  }

  getType() {
    return Protocol.definition().BuildingType.CircuitBoardPrinter
  }

  getInputStorageIndices() {
    return [0, 1]
  }

  getOutputStorageIndex() {
    return 2
  }

  isProcessable() {
    const inputItems = this.getInputItems(this.getInputStorageIndices())
    const copperBar = inputItems[0]
    const glass = inputItems[1]

    if (!copperBar || !glass) return false

    return copperBar.getType() === Protocol.definition().BuildingType.CopperBar &&
      glass.getType() === Protocol.definition().BuildingType.Glass
  }

  canProceed() {
    if (!this.hasMetPowerRequirement()) return false
    if (this.isStorageFull()) return false

    return this.isProcessable()
  }

  canStoreInBuilding(index, item) {
    if (!item) return true

    if (index === 0) {
      return item.getType() === Protocol.definition().BuildingType.CopperBar
    }

    if (index === 1) {
      return item.getType() === Protocol.definition().BuildingType.Glass
    }

    return false
  }

  onStorageChanged(item, index) {
    super.onStorageChanged(item, index)

    if (this.canProceed()) {
      this.addProcessor(this)
    }
  }

  onPowerChanged() {
    super.onPowerChanged()

    if (this.canProceed()) {
      this.addProcessor(this)
    }
  }

  createOutputItem() {
    if (!this.isProcessable()) return null

    return this.sector.createItem(
      Protocol.definition().BuildingType.CircuitBoard,
      { count: 1 }
    )
  }

  executeTurn() {
    const isOneSecondInterval =
      this.game.timestamp % (Constants.physicsTimeStep * 1) === 0

    if (!isOneSecondInterval) return

    this.increaseProgress()
  }
}

module.exports = CircuitBoardPrinter