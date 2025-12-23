const BaseProcessor = require("./base_processor")
const Protocol = require('../../../common/util/protocol')
const Attachments = require("./../equipments/armor/attachments")

class SuitWorkstation extends BaseProcessor {
  constructor(container, data) {
    super(container, data)
    this.slotCount = 2 // 0: armor, 1: attachment, 2: magnet (optional)
  }

  getConstantsTable() {
    return "Buildings.SuitWorkstation"
  }

  getType() {
    return Protocol.definition().BuildingType.SuitWorkstation
  }

  // Helper to get item in slot
  getInputSlot(index) {
    return this.inputItems && this.inputItems[index]
  }

  removeInputSlot(index) {
    if (this.inputItems && this.inputItems[index]) {
      this.inputItems[index] = null
    }
  }
  executeTurn() {
    const isThreeSecondInterval = this.game.timestamp % (Constants.physicsTimeStep * 3) === 0
    if (!isThreeSecondInterval) return

    this.increaseProgress()
  }

  // Validation logic
  isProcessable() {
    console.log("isProcessable")
    const inputItems = this.getInputItems(this.getInputStorageIndices())
    const armor = inputItems[0] //this should work
    const attachment = inputItems[1]
    //const magnet = this.getInputSlot(2)
    console.log("hmmmm", armor.isArmor())
    if (!armor || !attachment) return false
    console.log("items are there")
    if (!armor.isArmor()) return false
    console.log("first check")
    // Ensure attachments is initialized
    if (!Array.isArray(armor.attachments)) armor.attachments = []

    const klass = armor.getKlass(armor.type)
    const constants = klass.prototype.getConstants()
    const maxSlots = constants.attachmentSlots
    if (armor.attachments.length >= maxSlots) return false
    console.log("herrroooo")
    // Check attachment validity
    const attData = Attachments[attachment.id]
    if (!attData) return false
    if (armor.attachments.find(a => a.id === attachment.id)) return false
    console.log("third check")
    /*
    // Magnet requirement for high tier
    const attTier = attData.tier || 1
    if (attTier >= 4) {
      if (!magnet || magnet.tier < attTier) return false
    }
    */
    return true
  }

  canStoreInBuilding(index, item) {
    if (!item) return true // Allow removing items)
    if (index === 0) {
      if (!item.isArmor()) return false

      // Ensure attachments is initialized
      if (!Array.isArray(item.attachments)) item.attachments = []
      // Get max slots (using hardcoded lookup)
      const klass = item.getKlass(item.type)
      const constants = klass.prototype.getConstants()
      const maxSlots = constants.attachmentSlots || 0
      const usedSlots = item.attachments.length || 0
      if (usedSlots >= maxSlots) item.owner.showError("No available attachment slots on this armor.")
      if (maxSlots === 0) item.owner.showError("This armor cannot accept attachments.")
      return usedSlots < maxSlots
    }

    if (index === 1) {
      return item.isAttachment()
    }

    if (index === 2) {
      return item.getTypeName ? item.getTypeName() === "Magnet" : false
    }

    return false
  }

  getOutputStorageIndex() {
    return 2
  }

  getInputStorageIndices() {
    return [0, 1, 2]
  }

  createOutputItem() {
    console.log("createOutputItem",this.isProcessable())
    if (!this.isProcessable()) return null

    const armor = this.getInputSlot(0)
    const attachment = this.getInputSlot(1)
    const magnet = this.getInputSlot(2)

    // Ensure attachments is initialized
    if (!Array.isArray(armor.attachments)) armor.attachments = []

    // Add attachment
    armor.addAttachment(Attachments[attachment.id])
    armor.updateStatsFromAttachments()

    // Remove used items
    this.removeInputSlot(0) // Armor
    this.removeInputSlot(1) // Attachment
    if (Attachments[attachment.id].tier >= 4) {
      this.removeInputSlot(2) // Magnet
    }

    // Return the upgraded armor
    return armor
  }
}

module.exports = SuitWorkstation