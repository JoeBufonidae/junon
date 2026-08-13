const BaseAttachment = require("./base_attachment")
const Protocol = require("../../../../../common/util/protocol")
const Constants = require("../../../../../common/constants.json")

class MeleeSpeedAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.MeleeSpeedAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.MeleeSpeedAttachment
  }

  get modifiers() {
    return {
      meleeSpeedBoost: Constants.Attachments.MeleeSpeedAttachment.meleeSpeedBoost
    }
  }
}

module.exports = MeleeSpeedAttachment
