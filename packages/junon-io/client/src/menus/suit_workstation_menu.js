const SocketUtil = require("./../util/socket_util")
const ProcessorMenu = require("./processor_menu")
const BaseMenu = require("./base_menu")
const Equipments = require("./../entities/equipments/index")
const Attachments = require("./../entities/equipments/armor/attachments")

class SuitWorkstationMenu extends ProcessorMenu {
  open(entity) {
    this.entity = entity

    this.cleanup()

    this.storageId = entity.id

    this.el.classList.remove("processor_output_only")

    this.el.querySelector(".menu_main_header").innerText =
      i18n.t("Suit Workstation")

    this.el.querySelector(".menu_description").innerText =
      i18n.t(entity.getMenuDescription())

    this.el.querySelector(".processor_status_message").innerText = ""

    this.render()
    SocketUtil.emit("ViewStorage", {
      id: this.storageId
    })

    this.initPlayerInventoryStorage()
    this.initPlayerInventorySlotListeners()

    BaseMenu.prototype.open.call(this)
  }

  render() {
    if (!this.entity) return

    this.setupWorkstationMenu()
  }

  setupWorkstationMenu() {
    const storageDiv = this.el.querySelector(".processor_storage")
    if (!storageDiv) return

    storageDiv.classList.add("storage")
    storageDiv.dataset.storageId = this.storageId

    storageDiv.innerHTML = ""

    const container = document.createElement("div")
    container.className = "suit_workstation_ui"

    // Top row: suit + installed attachments
    const topRow = document.createElement("div")
    topRow.className = "suit_workstation_top_row"

    // Suit section
    const suitSection = document.createElement("div")
    suitSection.className = "suit_workstation_suit_section"

    const suitLabel = document.createElement("div")
    suitLabel.className = "suit_workstation_section_label"
    suitLabel.innerText = "SUIT"

    const slotsWrapper = document.createElement("div")
    slotsWrapper.innerHTML = this.createInventorySlots(3)

    const suitSlot = slotsWrapper.children[0]
    const attachmentSlot = slotsWrapper.children[1]
    const magnetSlot = slotsWrapper.children[2]

    suitSlot.classList.add(
      "suit_workstation_slot",
      "suit_workstation_suit_slot"
    )

    attachmentSlot.classList.add("suit_workstation_slot")
    magnetSlot.classList.add("suit_workstation_slot")

    suitSection.appendChild(suitLabel)
    suitSection.appendChild(suitSlot)

    // Installed attachments
    const attachmentsSection = document.createElement("div")
    attachmentsSection.className = "suit_workstation_attachments"

    const attachmentsLabel = document.createElement("div")
    attachmentsLabel.className = "suit_workstation_section_label"
    attachmentsLabel.innerText = "INSTALLED"

    const attachmentSlots = document.createElement("div")
    attachmentSlots.className = "suit_workstation_attachment_slots"

    attachmentsSection.appendChild(attachmentsLabel)
    attachmentsSection.appendChild(attachmentSlots)

    topRow.appendChild(suitSection)
    topRow.appendChild(attachmentsSection)

    // Input slots
    const inputs = document.createElement("div")
    inputs.className = "suit_workstation_inputs"

    const attachmentInput = document.createElement("div")
    attachmentInput.className = "suit_workstation_input"

    const attachmentInputLabel = document.createElement("div")
    attachmentInputLabel.className = "suit_workstation_section_label"
    attachmentInputLabel.innerText = "ATTACHMENT"

    attachmentInput.appendChild(attachmentInputLabel)
    attachmentInput.appendChild(attachmentSlot)

    const magnetInput = document.createElement("div")
    magnetInput.className = "suit_workstation_input"

    const magnetInputLabel = document.createElement("div")
    magnetInputLabel.className = "suit_workstation_section_label"
    magnetInputLabel.innerText = "MAGNET"

    magnetInput.appendChild(magnetInputLabel)
    magnetInput.appendChild(magnetSlot)

    inputs.appendChild(attachmentInput)
    inputs.appendChild(magnetInput)

    // Action button
    const button = document.createElement("button")
    button.className = "suit_workstation_action_button"
    button.innerText = "ATTACH"

    button.addEventListener("click", () => {
      SocketUtil.emit("InteractTarget", {
        id: this.entity.id,
        action: "add"
      })
    })

    inputs.appendChild(button)

    // Progress bar
    const progressContainer = document.createElement("div")
    progressContainer.className = "suit_workstation_progress"

    const progressFill = document.createElement("div")
    progressFill.className = "suit_workstation_progress_fill"

    progressContainer.appendChild(progressFill)

    container.appendChild(topRow)
    container.appendChild(inputs)
    container.appendChild(progressContainer)

    storageDiv.appendChild(container)

    // Initialize real inventory slots

    for (const slot of [suitSlot, attachmentSlot, magnetSlot]) {
      this.initInventorySlotListener(slot)

      slot.addEventListener(
        "click",
        this.onInventoryClick.bind(this),
        true
      )
    }

    this.actionButton = button
    this.progressBar = progressFill
    this.installedAttachmentSlots = attachmentSlots
    this.updateInstalledAttachments()
  }

  updateStorageInventory(data) {
    BaseMenu.prototype.updateStorageInventory.call(this, data)

    if (data.progress !== undefined && this.progressBar) {
      this.progressBar.style.width = data.progress + "%"
    }
  }

  updateInstalledAttachments(types = null) {
    if (!this.installedAttachmentSlots) return

    if (types === null) {
      const parts = this.entity.content
        ? this.entity.content.split(":")
        : []

      types = parts[3]
        ? parts[3].split(",").filter(Boolean)
        : []
    }

    const container = this.installedAttachmentSlots
    container.innerHTML = ""

    let slotCount = types.length
    let constants = null

    if (this.entity.armor && this.entity.armor.getConstants) {
      constants = this.entity.armor.getConstants()
    } else if (this.entity.content) {
      const suitType = this.entity.content.split(":")[0]

      if (suitType) {
        const SuitKlass = Equipments.forType(suitType)

        if (SuitKlass && SuitKlass.prototype.getConstants) {
          constants = SuitKlass.prototype.getConstants()
        }
      }
    }

    if (constants) {
      slotCount = Math.max(
        slotCount,
        constants.attachmentSlots || 0
      )
    }

    for (let i = 0; i < slotCount; i++) {
      const slot = document.createElement("div")

      slot.className =
        "inventory_slot suit_workstation_installed_slot"

      slot.dataset.displaySlot = "true"
      slot.dataset.installedAttachment = "true"
      slot.draggable = false

      const img = document.createElement("img")
      img.src = ""

      const type = types[i]

      if (type) {
        const AttachmentKlass =
          Attachments.forType(parseInt(type))

        if (AttachmentKlass) {
          img.src =
            "/assets/images/" +
            AttachmentKlass.prototype.getSpritePath()

          slot.dataset.type = type
        }
      }

      slot.appendChild(img)
      container.appendChild(slot)

      this.initInventorySlotListener(slot)
    }
  }
}

module.exports = SuitWorkstationMenu