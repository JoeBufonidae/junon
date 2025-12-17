const Helper = require("./../../../../../../common/helper")

const Attachments = {}
Attachments.SpeedAttachment = require("./speed_attachment")


Attachments.forType = (type) => {
  const klassName = Helper.getTypeNameById(type)
  return Attachments[klassName]
}

Attachments.getList = () => {
  return [Attachments.SpeedAttachment]
}


module.exports = Attachments
