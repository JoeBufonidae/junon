const BaseAttachment = require("./base_attachment")
const Protocol = require("../../../../../common/util/protocol")
const Constants = require("../../../../../common/constants.json")

class SpeedAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.SpeedAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.SpeedAttachment
  }

  get modifiers() {
    return {
      speed: Constants.Attachments.SpeedAttachment.speedBoost
    }
  }
}

module.exports = SpeedAttachment