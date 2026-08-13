const BaseAttachment = require("./base_attachment")
const Protocol = require("../../../../../common/util/protocol")
const Constants = require("../../../../../common/constants.json")

class HealthBoostAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.HealthBoostAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.HealthBoostAttachment
  }

  get modifiers() {
    return {
      healthBoost: Constants.Attachments.HealthBoostAttachment.healthBoost
    }
  }
}

module.exports = HealthBoostAttachment
