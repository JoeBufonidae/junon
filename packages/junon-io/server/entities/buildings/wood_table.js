const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const BaseBuilding = require("./base_building")

class WoodTable extends BaseBuilding {

  getConstantsTable() {
    return "Buildings.WoodTable"
  }
  
  isPenetrable() {
    return true
  }

  getType() {
    return Protocol.definition().BuildingType.WoodTable
  }

}

module.exports = WoodTable
