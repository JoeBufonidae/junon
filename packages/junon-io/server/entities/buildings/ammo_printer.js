const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const Helper = require('../../../common/helper')
const BaseBuilding = require("./base_building")
const Ammos = require("./../ammos/index")

const ExplosiveTypes = new Set([
  "Dynamite",
  "Grenade",
  "PoisonGrenade",
  "ShockGrenade",
  "TimerBomb"
])

class AmmoPrinter extends BaseBuilding {

  getConstantsTable() {
    return "Buildings.AmmoPrinter"
  }

  getType() {
    return Protocol.definition().BuildingType.AmmoPrinter
  }

  canCraft(type) {
    if (this.isFull()) return false

    return !!Ammos.forType(type) || ExplosiveTypes.has(Helper.getTypeNameById(type))
  }

  craft(item, inventoryInput) {
    if (!this.hasMetPowerRequirement()) return
      
    const isSuccessful = item.craft(inventoryInput)
    if (isSuccessful) {
      this.store(item)
    }

    return isSuccessful
  }

}

module.exports = AmmoPrinter
