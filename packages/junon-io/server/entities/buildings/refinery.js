const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const BaseProcessor = require("./base_processor")
const Bars = require("./../bars/index")

class Refinery extends BaseProcessor {

  onConstructionFinished() {
    super.onConstructionFinished()

  }

  getConstantsTable() {
    return "Buildings.Refinery"
  }
  getOutputStorageIndex() {
    return 2
  }

  canProceed() {
    // deprecated
    //return false

    let outputItem = this.getOutputItem()
    if (outputItem && outputItem.isFullyStacked()) return false
      
    return this.hasMetPowerRequirement() && this.getInputItems(this.getInputStorageIndices())[0]
  }

  onPowerChanged() {
    super.onPowerChanged()

    if (this.isPowered) {
    //comment out below line to disable
      this.container.addProcessor(this)
    }
  }

  getType() {
    return Protocol.definition().BuildingType.Refinery
  }

  isProcessable(inputItems) {
    const inputItem = inputItems[0]
    console.log(inputItems.length)
    return inputItem.isOre() || inputItem.isBar()
  }

  createOutputItem(inputItem) {
    //comment out below to disable
    return this.sector.createItem("Gold", { count: Math.floor(inputItem.getCost() / 2) })
  }

}

module.exports = Refinery


