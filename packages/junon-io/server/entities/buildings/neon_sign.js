const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const Sign = require("./sign")

class NeonSign extends Sign {

  getConstantsTable() {
    return "Buildings.NeonSign"
  }

  getType() {
    return Protocol.definition().BuildingType.NeonSign
  }

}

module.exports = NeonSign
