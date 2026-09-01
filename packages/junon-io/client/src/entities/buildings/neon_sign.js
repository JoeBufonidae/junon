const Sign = require("./sign")
const Constants = require("./../../../../common/constants.json")
const Protocol = require("./../../../../common/util/protocol")

class NeonSign extends Sign {


  getType() {
    return Protocol.definition().BuildingType.NeonSign
  }

  getSpritePath() {
    return "neon_sign.png"
  }

  getConstantsTable() {
    return "Buildings.NeonSign"
  }

}

module.exports = NeonSign
