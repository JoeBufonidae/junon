const Helper = require("./../../../../../../common/helper")

const Attachments = {}
Attachments.SpeedAttachment = require("./speed_attachment")
Attachments.ArmorBoostAttachment = require("./armor_boost_attachment")
Attachments.HealthBoostAttachment = require("./health_boost_attachment")
Attachments.MeleeSpeedAttachment = require("./melee_speed_attachment")
Attachments.KnockbackAttachment = require("./knockback_attachment")
Attachments.MeleeDamageAttachment = require("./melee_damage_attachment")

Attachments.forType = (type) => {
  const klassName = Helper.getTypeNameById(type)
  return Attachments[klassName]
}

Attachments.getList = () => {
  return [
    Attachments.SpeedAttachment,
    Attachments.ArmorBoostAttachment,
    Attachments.HealthBoostAttachment,
    Attachments.MeleeSpeedAttachment,
    Attachments.KnockbackAttachment,
    Attachments.MeleeDamageAttachment
  ]
}

module.exports = Attachments
