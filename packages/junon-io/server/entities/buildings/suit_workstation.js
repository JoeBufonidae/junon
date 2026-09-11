const BaseProcessor = require("./base_processor")
const BaseBuilding = require("./base_building")
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

  startProcessing(action) {
    if (this.isProcessing) return false
    if (!this.isProcessable()) return false

    this.progress = 0
    this.processingAction = action
    this.addProcessor()

    return true
  }

  onStorageChanged(item, index) {
    BaseBuilding.prototype.onStorageChanged.call(this, item, index)

    this.setBuildingContent(this.getStorageContentType())
  }

getStorageContentType() {
  const armor = this.get(0)
  const attachment = this.get(1)

  if (!armor && !attachment) return ""

  const armorType = armor ? armor.type.toString() : ""
  const suitColor = armor && armor.instance ? armor.instance.content : ""
  const color = suitColor || ""
  const attachmentType = attachment ? attachment.getType().toString() : ""

  let installedAttachments = ""

  if (
    armor &&
    armor.instance &&
    Array.isArray(armor.instance.attachments)
  ) {
    installedAttachments = armor.instance.attachments
      .map(attachment => {
        if (typeof attachment.getType === "function") {
          return attachment.getType()
        }

        return attachment.type || attachment.id
      })
      .filter(type => type !== undefined && type !== null)
      .join(",")
  }

  return [
    armorType,
    color,
    attachmentType,
    installedAttachments
  ].join(":")
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

    const inputItems = this.getInputItems(this.getInputStorageIndices())
    const outputItem = this.createOutputItem()

    if (!outputItem) return

    const attachmentType = inputItems[1]
      ? inputItems[1].getType()
      : null

    const attData = attachmentType
      ? Attachments.forType(attachmentType)
      : null

    // Consume inputs FIRST
    if (inputItems[0]) inputItems[0].consume()
    if (inputItems[1]) inputItems[1].consume()

    if (attData && attData.tier >= 4 && inputItems[2]) {
      inputItems[2].consume()
    }

    // Put completed armor into the normal suit slot
    this.storeAt(0, outputItem)
  }

  executeTurn() {
    const isOneSecondInterval = this.game.timestamp % (Constants.physicsTimeStep * 1) === 0
    if (!isOneSecondInterval) return

    this.increaseProgress()
  }

  interact(player, action) {
    if (action === "add") {
      this.startProcessing("add")
    }
  }

  // Validation logic
  isProcessable() {
    const inputItems = this.getInputItems(this.getInputStorageIndices())
    const armor = inputItems[0]
    const attachment = inputItems[1]

    if (!armor || !attachment) return false
    if (typeof armor.isArmor !== "function") return false
    if (!armor.isArmor()) return false

    const armorInstance = armor.instance
    if (!armorInstance) return false

    if (!Array.isArray(armorInstance.attachments)) {
      armorInstance.attachments = []
    }

    const klass = armor.getKlass(armor.type)
    const constants = klass.prototype.getConstants()
    const maxSlots = constants.attachmentSlots || 0

    if (armorInstance.attachments.length >= maxSlots) return false

    if (
      armorInstance.attachments.find(
        a => a.getType() === attachment.getType()
      )
    ) {
      return false
    }

    if (!attachment.isAttachment()) return false

    return true
  }
    /*
    // Magnet requirement for high tier
    const attTier = attData.tier || 1
    if (attTier >= 4) {
      if (!magnet || magnet.tier < attTier) return false
    }
    */
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
      getName: () =>
        attachmentItem.getTypeName
          ? attachmentItem.getTypeName()
          : "",
      tier:
        AttachmentKlass.tier ||
        (AttachmentKlass.prototype && AttachmentKlass.prototype.tier) ||
        1,
      modifiers:
        (AttachmentKlass.prototype && AttachmentKlass.prototype.modifiers) || {},
      isAttachment: () => true,

      applyEffect(player) {
        return AttachmentKlass.prototype.applyEffect.call(this, player)
      },

      removeEffect(player) {
        return AttachmentKlass.prototype.removeEffect.call(this, player)
      }
    }

    const newItem = Object.create(Object.getPrototypeOf(armorItem))
    Object.assign(newItem, armorItem)
    newItem.count = 1

    const newInstance = Object.create(Object.getPrototypeOf(armorInstance))
    Object.assign(newInstance, armorInstance)

    newInstance.attachments = Array.isArray(armorInstance.attachments)
      ? armorInstance.attachments.slice()
      : []

    if (typeof newInstance.addAttachment === "function") {
      newInstance.addAttachment(attWrapper)
    } else {
      newInstance.attachments.push(attWrapper)
    }

    if (typeof newInstance.updateStatsFromAttachments === "function") {
      newInstance.updateStatsFromAttachments()
    }

    newItem.instance = newInstance

    return newItem
  }
}

module.exports = SuitWorkstation