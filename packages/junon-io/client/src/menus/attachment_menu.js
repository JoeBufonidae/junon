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
    const totalSlots = attachmentEntity ? (attachmentEntity.getConstants().attachmentSlots || 0) : 0
    const usedSlots = attachments.length

    if (this.usedSlotsEl) {
      this.usedSlotsEl.innerText = usedSlots
    }

    if (this.totalSlotsEl) {
      this.totalSlotsEl.innerText = totalSlots
    }

    if (!this.attachmentListEl) return

    this.attachmentListEl.innerHTML = ""

    if (!attachments.length) {
      if (this.attachmentListEmptyEl) {
        this.attachmentListEmptyEl.style.display = "block"
      }
      return
    }

    if (this.attachmentListEmptyEl) {
      this.attachmentListEmptyEl.style.display = "none"
    }

    attachments.forEach((attachment) => {
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
      const row = document.createElement("div")
      row.className = "attachment_list_row"
      row.innerHTML = "<span class='attachment_name'>" + attachmentName + "</span>" + tierLabel
      this.attachmentListEl.appendChild(row)
    })
  }

  findEntity() {
    if (!this.entityId || !this.game.player) return null

    const equipments = this.game.player.equipments || {}
    return Object.values(equipments).find((entity) => entity && entity.id === this.entityId) || null
  }

  getAttachments(entity) {
    if (!entity) return []
    // common places attachments may be serialized to
    if (entity.instance && Array.isArray(entity.instance.attachments)) {
      return entity.instance.attachments
    }

    if (entity.data && entity.data.instance && Array.isArray(entity.data.instance.attachments)) {
      return entity.data.instance.attachments
    }

    if (entity.data && Array.isArray(entity.data.attachments)) {
      return entity.data.attachments
    }

    // some server code exposes a lightweight attachmentData array
    if (entity.data && Array.isArray(entity.data.attachmentData)) {
      return entity.data.attachmentData
    }

    if (Array.isArray(entity.attachmentData)) {
      return entity.attachmentData
    }

    if (Array.isArray(entity.attachments)) {
      return entity.attachments
    }

    return []
  }
}

module.exports = AttachmentMenu
