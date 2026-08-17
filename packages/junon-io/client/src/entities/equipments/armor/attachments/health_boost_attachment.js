const BaseAttachment = require("./base_attachment")
const Constants = require("./../../../../../../common/constants.json")
const Protocol = require("./../../../../../../common/util/protocol")

class HealthBoostAttachment extends BaseAttachment {
  getSpritePath() {
    return 'attachment_health.png'
  }

  repositionSprite() {
    super.repositionSprite()
  }

  getType() {
    return Protocol.definition().BuildingType.HealthBoostAttachment
  }

  getConstantsTable() {
    return "Attachments.HealthBoostAttachment"
  }
}

module.exports = HealthBoostAttachment
