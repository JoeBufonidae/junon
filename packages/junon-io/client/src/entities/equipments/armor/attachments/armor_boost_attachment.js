const BaseAttachment = require("./base_attachment")
const Constants = require("./../../../../../../common/constants.json")
const Protocol = require("./../../../../../../common/util/protocol")

class ArmorBoostAttachment extends BaseAttachment {
  getSpritePath() {
    return 'attachment_armor.png'
  }

  repositionSprite() {
    super.repositionSprite()
  }

  getType() {
    return Protocol.definition().BuildingType.ArmorBoostAttachment
  }

  getConstantsTable() {
    return "Attachments.ArmorBoostAttachment"
  }
}

module.exports = ArmorBoostAttachment
