const BaseProcessor = require("./base_processor")
const Protocol = require('../../../common/util/protocol')
const Attachments = require("./../equipments/armor/attachments")

class SuitWorkstation extends BaseProcessor {
  constructor(container, data) {
    super(container, data)
    this.slotCount = 3 // 0: armor, 1: attachment, 2: magnet (optional)
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

  // Validation logic
  isProcessable() {
    const armor = this.getInputSlot(0)
    const attachment = this.getInputSlot(1)
    const magnet = this.getInputSlot(2)

    if (!armor || !attachment) return false
    if (!armor.isArmor()) return false

    // Check open slots
    const maxSlots = armor.getConstants().attachmentSlots || 0
    if ((armor.attachments?.length || 0) >= maxSlots) return false

    // Check attachment validity
    const attData = Attachments[attachment.id]
    if (!attData) return false
    if (armor.attachments?.find(a => a.id === attachment.id)) return false

    // Magnet requirement for high tier
    const attTier = attData.tier || 1
    if (attTier >= 4) {
      if (!magnet || magnet.tier < attTier) return false
    }

    return true
  }

  canStoreInBuilding(index, item) {
    if (!item) return true // allow removing items
//item.getTypeName()
    if (index === 0) {
        // Only allow armor with open attachment slots
        if (!item.isArmor) return false
        if (!item.isArmor()) return false
        const maxSlots = item.getConstants().attachmentSlots || 0
        const usedSlots = (item.attachments?.length || 0)
        return usedSlots < maxSlots
    }

    if (index === 1) {
        return item.isAttachment()
    }

    if (index === 2) {
        // Only allow magnets (assuming item.type === 'magnet' or similar)
        return item.getTypeName() === "Magnet"
    }

    return false
    }

  createOutputItem() {
    if (!this.isProcessable()) return null

    const armor = this.getInputSlot(0)
    const attachment = this.getInputSlot(1)
    const magnet = this.getInputSlot(2)

    // Clone armor (if needed, or just modify in place)
    armor.addAttachment(Attachments[attachment.id])
    armor.updateStatsFromAttachments()

    // Remove used items
    this.removeInputSlot(1) // attachment
    if (Attachments[attachment.id].tier >= 4) {
      this.removeInputSlot(2) // magnet
    }

    // Return the upgraded armor (in place)
    return armor
  }
}

module.exports = SuitWorkstation