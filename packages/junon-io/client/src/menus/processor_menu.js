const SocketUtil = require("./../util/socket_util")
const BaseMenu = require("./base_menu")
const Item = require("./../entities/item")

class ProcessorMenu extends BaseMenu {
  onMenuConstructed() {
    this.progressBar = this.el.querySelector(".processor_progress_bar_fill")
  }

  initProcessing() {
  }

  initListeners() {
    super.initListeners()

    Array.from(this.el.querySelectorAll(".inventory_slot")).forEach((el) => {
      this.initInventorySlotListener(el)
      el.addEventListener("click", this.onInventoryClick.bind(this), true)
    })
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

    let progressWidth = data.progress / 100 * this.getProgressMaxWidth()
    this.progressBar.style.width = progressWidth + "px"
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

    const storageDiv = this.el.querySelector(".processor_storage")
    storageDiv.innerHTML = ""

    // Determine number of input slots
    const slotCount = entity.slotCount || (entity.getStorageCount && entity.getStorageCount()) || 1

    // Create input slots dynamically
    if (!shouldHideInput) {
      for (let i = 0; i < slotCount; i++) {
        const slotDiv = document.createElement("div")
        slotDiv.className = "input_inventory inventory_slot"
        slotDiv.dataset.index = i
        slotDiv.innerHTML = "<img src=''>"
        storageDiv.appendChild(slotDiv)
      }
    }

    // Add progress bar and output slot
    const progressBarDiv = document.createElement("div")
    progressBarDiv.className = "processor_progress_bar"
    progressBarDiv.innerHTML = `
      <div class='processor_progress_bar_container'>
        <div class='processor_progress_bar_fill'></div>
      </div>
      <div class='arrow-right'></div>
    `
    storageDiv.appendChild(progressBarDiv)

    // Output slot (always index = slotCount)
    const outputDiv = document.createElement("div")
    outputDiv.className = "output_inventory inventory_slot"
    outputDiv.dataset.index = slotCount
    outputDiv.innerHTML = "<img src=''>"
    storageDiv.appendChild(outputDiv)

    // Set up rest of menu
    this.el.querySelector(".processor_storage").dataset.storageId = this.storageId
    this.el.querySelector(".menu_main_header").innerText = i18n.t(header)
    this.el.querySelector(".menu_description").innerText = i18n.t(description)

    if (options.disabled) {
      this.isDisabled = true
      this.el.querySelector(".processor_status_message").innerText = i18n.t(options.disabled)
    } else {
      this.isDisabled = false
      this.el.querySelector(".processor_status_message").innerText = ""
    }

    SocketUtil.emit("ViewStorage", { id: this.storageId })

    this.initPlayerInventoryStorage()
    this.initPlayerInventorySlotListeners()
  }

  shouldHideQuickInventory() {
    return true
  }

  cleanup() {
    this.el.querySelector(".processor_storage").dataset.storageId = ""
    this.storageId = null

    Array.from(this.el.querySelectorAll(".inventory_slot")).forEach((inventorySlot) => {
      this.game.resetInventorySlot(inventorySlot)
    })

    this.progressBar.style.width = "0px"
  }

}



module.exports = ProcessorMenu
