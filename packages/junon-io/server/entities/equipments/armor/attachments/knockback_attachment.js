const BaseAttachment = require("./base_attachment")
const Protocol = require("../../../../../common/util/protocol")
const Constants = require("../../../../../common/constants.json")

class KnockbackAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.KnockbackAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.KnockbackAttachment
  }

  get modifiers() {
    return {
      knockback: Constants.Attachments.KnockbackAttachment.knockback
    }
  }
}

module.exports = KnockbackAttachment
