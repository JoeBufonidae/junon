const BaseAttachment = require("./base_attachment")
const Protocol = require('../../../../../common/util/protocol')
const Constants = require("../../../../../common/constants.json")

class SpeedAttachment extends BaseAttachment {
  getConstantsTable() {
    return "Attachments.SpeedAttachment"
  }

  getType() {
    return Protocol.definition().BuildingType.SpeedAttachment
  }

  applyEffect(player) {
    const speedBoost = Constants.Attachments.SpeedAttachment.speedBoost
    player.speed *= speedBoost
  }

  removeEffect(player) {
    const speedBoost = Constants.Attachments.SpeedAttachment.speedBoost
    player.speed /= speedBoost
  }
}

module.exports = SpeedAttachment
