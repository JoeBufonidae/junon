const BaseTransientEntity = require("../../../base_transient_entity")
const Helper = require('../../../../../common/helper')

class BaseAttachment extends BaseTransientEntity {

  static use(player, targetEntity) {
    // do nothing..
  }

  getType() {
    throw new Error("must implement BaseAttachment.getType")
  }
  getKlass() {
    return "attachment"
  }
  isAttachment() {
    return true
  }
  getTypeName() {
    return Helper.getTypeNameById(this.getType())
  }

  toJson() {
    return this.getType()
  }

}

module.exports = BaseAttachment