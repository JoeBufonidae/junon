const BaseAttachment = require("./base_attachment")
const Protocol = require("../../../../../common/util/protocol")
const Constants = require("../../../../../common/constants.json")

class ArmorBoostAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.ArmorBoostAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.ArmorBoostAttachment
  }

  get modifiers() {
    return {
      defense: Constants.Attachments.ArmorBoostAttachment.defenseBoost
    }
  }
}

module.exports = ArmorBoostAttachment
