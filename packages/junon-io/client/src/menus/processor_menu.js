const SocketUtil = require("./../util/socket_util")
const BaseMenu = require("./base_menu")
const Item = require("./../entities/item")

class ProcessorMenu extends BaseMenu {
  onMenuConstructed() {
  }

  initProcessing() {}

  initListeners() {
    super.initListeners()
  }

  close() {
    this.label = null
    if (!this.game.hideMainMenus) {
      this.showQuickInventory()
    }
    super.close()
  }

  onInventoryClick(event) {
    this.retrieveInventorySlot(event)
  }

  onInventoryChanged(data) {
    this.renderPlayerInventory(data)
  }

  hasPlayerInventory() {
    return true
  }

  updateStorageInventory(data) {
    super.updateStorageInventory(data)

    if (this.progressBar) {
      const progressWidth =
        (data.progress / 100) * this.getProgressMaxWidth()
      this.progressBar.style.width = progressWidth + "px"
    }
  }

  getProgressMaxWidth() {
    return 50
  }

  finishOpen() {
    super.open()
  }

  open(header, entity, description, shouldHideInput = false, footer = "", options = {}) {
    this.cleanup()

    this.storageId = entity.id
    console.log("this is something triggered here", shouldHideInput)
    if (shouldHideInput) {
      this.el.classList.add("processor_output_only")
    } else {
      this.el.classList.remove("processor_output_only")
    }

    this.el.querySelector(".menu_main_header").innerText = i18n.t(header)
    this.el.querySelector(".menu_description").innerText = i18n.t(description)

    if (options.disabled) {
      this.isDisabled = true
      this.el.querySelector(".processor_status_message").innerText =
        i18n.t(options.disabled)
    } else {
      this.isDisabled = false
      this.el.querySelector(".processor_status_message").innerText = ""
    }

    const storageDiv = this.el.querySelector(".processor_storage")
    storageDiv.dataset.storageId = this.storageId
    storageDiv.innerHTML = ""

    const slotCount = entity.getConstants().storageCount

    for (let i = 0; i < slotCount; i++) {
      const slot = document.createElement("div")
      slot.className = "inventory_slot"
      slot.dataset.index = i
      slot.innerHTML = "<img src=''>"

      storageDiv.appendChild(slot)
      this.initInventorySlotListener(slot)
      slot.addEventListener("click", this.onInventoryClick.bind(this), true)

      // Insert progress bar before final output slot
      if (i === slotCount - 2) {
        const bar = document.createElement("div")
        bar.className = "processor_progress_bar"
        bar.innerHTML = `
          <div class='processor_progress_bar_container'>
            <div class='processor_progress_bar_fill'></div>
          </div>
          <div class='arrow-right'></div>
        `
        storageDiv.appendChild(bar)
      }
    }

    SocketUtil.emit("ViewStorage", { id: this.storageId })

    this.initPlayerInventoryStorage()
    this.initPlayerInventorySlotListeners()

    // cache progress bar AFTER it exists
    this.progressBar = this.el.querySelector(".processor_progress_bar_fill")
  }

  shouldHideQuickInventory() {
    return true
  }

  cleanup() {
    const storageDiv = this.el.querySelector(".processor_storage")
    storageDiv.dataset.storageId = ""
    this.storageId = null

    Array.from(this.el.querySelectorAll(".inventory_slot")).forEach(slot => {
      this.game.resetInventorySlot(slot)
    })

    if (this.progressBar) {
      this.progressBar.style.width = "0px"
    }

    this.progressBar = null
  }
}

module.exports = ProcessorMenu
