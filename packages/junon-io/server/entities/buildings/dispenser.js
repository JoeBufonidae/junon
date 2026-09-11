const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const VendingMachine = require("./vending_machine")

class Dispenser extends VendingMachine {

  getConstantsTable() {
    return "Buildings.Dispenser"
  }

  canStoreInBuilding(index, item) {
    if (!item) return true // allow swap with blank space slot
    
    return !item.isDrink() && !item.isFood()
  }

  getType() {
    return Protocol.definition().BuildingType.Dispenser
  }

}

module.exports = Dispenser
