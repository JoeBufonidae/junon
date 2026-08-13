const BaseAttachment = require("./base_attachment")
const Protocol = require("../../../../../common/util/protocol")
const Constants = require("../../../../../common/constants.json")

class MeleeDamageAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.MeleeDamageAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.MeleeDamageAttachment
  }

  get modifiers() {
    return {
      meleeDamage: Constants.Attachments.MeleeDamageAttachment.meleeDamage
    }
  }
}

module.exports = MeleeDamageAttachment
