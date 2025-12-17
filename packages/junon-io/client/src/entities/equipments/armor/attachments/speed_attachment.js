const BaseAttachment = require("./base_attachment")
const Constants = require("./../../../../../../common/constants.json")
const Protocol = require("./../../../../../../common/util/protocol")

class SpeedAttachment extends BaseAttachment {

  getSpritePath() {
    return 'mockattachment.png'
  }

  repositionSprite() {
    super.repositionSprite()
    //this.sprite.scale.set(1.5)
  }
  getType() {
    return Protocol.definition().BuildingType.SpeedAttachment
  }

  getConstantsTable() {
    return "Attachments.SpeedAttachment"
  }

}

module.exports = SpeedAttachment
