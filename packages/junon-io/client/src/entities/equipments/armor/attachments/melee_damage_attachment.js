const BaseAttachment = require("./base_attachment")
const Constants = require("./../../../../../../common/constants.json")
const Protocol = require("./../../../../../../common/util/protocol")

class MeleeDamageAttachment extends BaseAttachment {
  getSpritePath() {
    return 'mockattachment.png'
  }

  repositionSprite() {
    super.repositionSprite()
    this.sprite.x = 31
    this.sprite.y = 0
    this.sprite.scale.x = 0.1
    this.sprite.scale.y = 0.1
  }

  getType() {
    return Protocol.definition().BuildingType.MeleeDamageAttachment
  }

  getConstantsTable() {
    return "Attachments.MeleeDamageAttachment"
  }
}

module.exports = MeleeDamageAttachment
