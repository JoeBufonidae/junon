const BaseMenu = require("./base_menu")
const Item = require("./../entities/item")
const Helper = require("./../../../common/helper")

class AttachmentMenu extends BaseMenu {
  onMenuConstructed() {
    this.usedSlotsEl = this.el.querySelector(".used_slots")
    this.totalSlotsEl = this.el.querySelector(".total_slots")
    this.attachmentListEl = this.el.querySelector(".attachment_list")
    this.attachmentListEmptyEl = this.el.querySelector(".attachment_list_empty")
  }

  open(options = {}) {
    super.open(options)
    this.entityId = options.entityId
    this.render()
  }

  render() {
    const attachmentEntity = this.findEntity()
    const attachments = this.getAttachments(attachmentEntity)
    const totalSlots = this.getTotalSlots(attachmentEntity)
    const usedSlots = attachments.length

    if (this.usedSlotsEl) {
      this.usedSlotsEl.innerText = usedSlots
    }

    if (this.totalSlotsEl) {
      this.totalSlotsEl.innerText = totalSlots
    }

    if (!this.attachmentListEl) return

    this.attachmentListEl.innerHTML = ""

    const slotEntries = []
    for (let index = 0; index < totalSlots; index++) {
      const attachment = attachments[index]
      if (attachment) {
        const attachmentType = attachment.type || attachment.id
        let attachmentName = attachment.name || Helper.getTypeNameById(attachmentType)

        try {
          const attachmentKlass = Item.getKlass(attachmentType)
          if (attachmentKlass) {
            attachmentName = attachmentKlass.getTypeName()
          }
        } catch (e) {
          // keep fallback name
        }

        const tierLabel = attachment.tier ? " <span class='attachment_tier'>(Tier " + attachment.tier + ")</span>" : ""
        const spritePath = attachmentType && Item.getKlass(attachmentType) ? Item.getKlass(attachmentType).prototype.getSpritePath() : ""
        const spriteMarkup = spritePath ? "<img class='attachment_sprite' src='/assets/images/" + spritePath + "' />" : ""
        slotEntries.push({
          name: attachmentName,
          tierLabel,
          spriteMarkup,
          isEmpty: false
        })
      } else {
        slotEntries.push({
          name: "[Empty]",
          tierLabel: "",
          spriteMarkup: "",
          isEmpty: true
        })
      }
    }

    if (!slotEntries.length) {
      if (this.attachmentListEmptyEl) {
        this.attachmentListEmptyEl.style.display = "block"
      }
      return
    }

    if (this.attachmentListEmptyEl) {
      this.attachmentListEmptyEl.style.display = "none"
    }

    slotEntries.forEach((entry) => {
      const row = document.createElement("div")
      row.className = "attachment_list_row"
      row.innerHTML = "<span class='attachment_name'>" + entry.name + "</span>" + entry.tierLabel + entry.spriteMarkup
      this.attachmentListEl.appendChild(row)
    })
  }

  getTotalSlots(entity) {
    if (!entity) return 0

    if (entity.getConstants && typeof entity.getConstants === "function") {
      return entity.getConstants().attachmentSlots || 0
    }

    if (entity.data && entity.data.getConstants && typeof entity.data.getConstants === "function") {
      return entity.data.getConstants().attachmentSlots || 0
    }

    if (entity.type) {
      try {
        const itemKlass = Item.getKlass(entity.type)
        if (itemKlass && itemKlass.prototype && itemKlass.prototype.getConstants) {
          return itemKlass.prototype.getConstants().attachmentSlots || 0
        }
      } catch (e) {
        // fall through to 0
      }
    }

    return 0
  }

  findEntity() {
    if (!this.entityId || !this.game.player) return null

    const candidates = []

    if (this.game.player.equipments) {
      candidates.push(...Object.values(this.game.player.equipments))
    }

    if (this.game.player.inventory) {
      candidates.push(...Object.values(this.game.player.inventory).filter((item) => !!item))
    }

    const targetId = String(this.entityId)
    return candidates.find((entity) => {
      if (!entity) return false

      const idsToCheck = [
        entity.id,
        entity.data && entity.data.id,
        entity.instance && entity.instance.id,
        entity.type,
        entity.data && entity.data.type,
        entity.instance && entity.instance.type
      ]

      return idsToCheck.some((id) => String(id) === targetId)
    }) || null
  }

  getAttachments(entity) {
    if (!entity) return []

    const possibleLists = []
    const addArray = (value) => {
      if (Array.isArray(value)) possibleLists.push(value)
    }

    addArray(entity.instance && entity.instance.attachments)
    addArray(entity.instance && entity.instance.attachmentData)
    addArray(entity.data && entity.data.instance && entity.data.instance.attachments)
    addArray(entity.data && entity.data.instance && entity.data.instance.attachmentData)
    addArray(entity.data && entity.data.attachments)
    addArray(entity.data && entity.data.attachmentData)
    addArray(entity.attachmentData)
    addArray(entity.attachments)

    for (const list of possibleLists) {
      if (list.length) return list
    }

    return []
  }
}

module.exports = AttachmentMenu
