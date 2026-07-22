const BaseProcessor = require("./base_processor")
const Protocol = require('../../../common/util/protocol')
const Attachments = require("./../equipments/armor/attachments")
const Constants = require('../../../common/constants')

class SuitWorkstation extends BaseProcessor {
  constructor(container, data) {
    super(container, data)
    this.slotCount = 4 // 0: armor, 1: attachment, 2: magnet, 3: output
  }

  getConstantsTable() {
    return "Buildings.SuitWorkstation"
  }

  getType() {
    return Protocol.definition().BuildingType.SuitWorkstation
  }

  onStorageChanged(item, index) {
    super.onStorageChanged(item, index)

    this.setBuildingContent(this.getStorageContentType())
  }

  getStorageContentType() {
    // Prefer showing armor from the output slot if present, otherwise the input slot
    const outputIndex = (typeof this.getOutputStorageIndex === 'function') ? this.getOutputStorageIndex() : 3
    let item = this.get(outputIndex) || this.get(0)
    if (!item) return ""

    let suitColor = item.instance && item.instance.content
    if (suitColor) {
      return [item.type.toString(), suitColor].join(":")
    }

    return item.type.toString()
  }

  // Helper to get item in slot
  getInputSlot(index) {
    const inputItems = this.getInputItems(this.getInputStorageIndices())
    return inputItems && inputItems[index]
  }

  removeInputSlot(index) {
    // map relative input index to actual storage index and remove it properly
    const inputStorage = this.getInputStorageIndices()
    const storageIndex = Array.isArray(inputStorage) ? inputStorage[index] : inputStorage
    if (typeof storageIndex === 'undefined') return
    // use removeAt to avoid calling storeAt(..., null)
    if (typeof this.removeAt === 'function') {
      this.removeAt(storageIndex)
    } else if (typeof this.storage !== 'undefined') {
      delete this.storage[storageIndex]
    }
  }

  onProgressChanged() {
    if (!this.hasReachedFullProgress()) return

    this.progress = 0

    const outputItem = this.createOutputItem()
    if (outputItem) {
      this.storeAt(this.getOutputStorageIndex(), outputItem)
      
      // Consume the input items
      const inputItems = this.getInputItems(this.getInputStorageIndices())
      if (inputItems[0]) inputItems[0].consume()
      if (inputItems[1]) inputItems[1].consume()
      const attData = Attachments.forType(inputItems[1].getType())
      if (attData && attData.tier >= 4 && inputItems[2]) {
        inputItems[2].consume()
      }
    }
  }

  executeTurn() {
    const isThreeSecondInterval = this.game.timestamp % (Constants.physicsTimeStep * 3) === 0
    if (!isThreeSecondInterval) return

    this.increaseProgress()
  }

  // Validation logic
  isProcessable() {
    const inputItems = this.getInputItems(this.getInputStorageIndices())
    const armor = inputItems[0]
    const attachment = inputItems[1]
    
    if (!armor || !attachment) return false
    if (!armor.isArmor) return false
    if (typeof armor.isArmor !== 'function') return false
    if (!armor.isArmor()) return false
    
    // Ensure attachments is initialized
    if (!Array.isArray(armor.attachments)) armor.attachments = []

    const klass = armor.getKlass(armor.type)
    const constants = klass.prototype.getConstants()
    const maxSlots = constants.attachmentSlots
    if (armor.attachments.length >= maxSlots) return false

    const attData = Attachments.forType(attachment.getType())
    if (!attData) return false
    if (armor.attachments.find(a => a.getType() === attachment.getType())) return false
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
    return 3
  }

  getInputStorageIndices() {
    return [0, 1, 2]
  }

  createOutputItem() {
    if (!this.isProcessable()) return null

    const inputItems = this.getInputItems(this.getInputStorageIndices())
    const armorItem = inputItems[0]
    const attachmentItem = inputItems[1]
    if (!armorItem || !attachmentItem) return null

    const armorInstance = armorItem.instance
    if (!armorInstance) return null

    const AttachmentKlass = Attachments.forType(attachmentItem.getType())
    if (!AttachmentKlass) return null

    const attachmentType = attachmentItem.getType()
    const attWrapper = {
      id: attachmentType,
      type: attachmentType,
      getType: () => attachmentType,
      getName: () => (attachmentItem.getTypeName ? attachmentItem.getTypeName() : ""),
      tier: AttachmentKlass.tier || (AttachmentKlass.prototype && AttachmentKlass.prototype.tier) || 1,
      speedBoost: (Constants.Attachments && Constants.Attachments.SpeedAttachment && Constants.Attachments.SpeedAttachment.speedBoost) || 2,
      modifiers: (AttachmentKlass.prototype && AttachmentKlass.prototype.modifiers) || {},
      isAttachment: () => true,
      applyEffect(player) {
        return AttachmentKlass.prototype.applyEffect.call(this, player)
      },
      removeEffect(player) {
        return AttachmentKlass.prototype.removeEffect.call(this, player)
      }
    }

    // Clone the item and its equipment instance so consuming the input won't zero the output
    const newItem = Object.create(Object.getPrototypeOf(armorItem))
    Object.assign(newItem, armorItem)
    newItem.count = 1
    newItem.attachmentData = [{
      id: attachmentType,
      type: attachmentType,
      tier: AttachmentKlass.tier || (AttachmentKlass.prototype && AttachmentKlass.prototype.tier) || 1
    }]

    const newInstance = Object.create(Object.getPrototypeOf(armorInstance))
    Object.assign(newInstance, armorInstance)
    newInstance.attachments = Array.isArray(armorInstance.attachments) ? armorInstance.attachments.slice() : []
    if (typeof newInstance.addAttachment === "function") {
      newInstance.addAttachment(attWrapper)
    } else {
      newInstance.attachments.push(attWrapper)
    }
    if (typeof newInstance.updateStatsFromAttachments === 'function') {
      newInstance.updateStatsFromAttachments()
    }

    newItem.instance = newInstance

    return newItem
  }
}

module.exports = SuitWorkstation