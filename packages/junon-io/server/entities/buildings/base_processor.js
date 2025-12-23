const BaseBuilding = require("./base_building")
const Constants = require('../../../common/constants.json')

class BaseProcessor extends BaseBuilding {
  onConstructionFinished() {
    super.onConstructionFinished()

    this.progress = 0
  }

  getInputStorageIndices() {
    return [0]
  }

  getOutputStorageIndex() {
    return 1
  }

  getMaxProgress() {
    return Math.floor(this.getProcessingRate() / this.sector.miningSpeed)
  }

  executeTurn() {
    const isOneSecondInterval = this.game.timestamp % (Constants.physicsTimeStep * 1) === 0
    if (!isOneSecondInterval) return

    this.increaseProgress()
  }

  canProceed() {
    if (this.isStorageFull()) return false
    let inputItems = this.getInputItems(this.getInputStorageIndices())
    return inputItems && this.isProcessable(inputItems)
  }

  increaseProgress() {
    if (!this.canProceed()) {
      this.removeProcessor()
      return
    }

    this.progress += 1
    this.onProgressChanged()
    this.notifyViewSubscribers()
  }

  isStorageFull() {
    let item = this.getOutputItem()
    return item && item.isFullyStacked()
  }

  notifyViewSubscribers() {
    Object.values(this.getViewSubscribers()).forEach((viewSubscriber) => {
      this.getSocketUtil().emit(viewSubscriber.getSocket(), "RenderStorage", {
        id: this.id,
        inventory: this,
        progress: this.getProgressPercentage()
      })
    })
  }

  getProgressPercentage() {
    return Math.floor((this.progress / this.getMaxProgress()) * 100)
  }

  hasReachedFullProgress() {
    return this.progress >= this.getMaxProgress()
  }

  onProgressChanged() {
    if (this.hasReachedFullProgress()) {
      this.progress = 0
      let inputItem = this.getInputItems(this.getInputStorageIndices())[0]

      let outputItem = this.createOutputItem(inputItem)
      if (outputItem) {
        this.storeAt(this.getOutputStorageIndex(), outputItem)
      }


      if (inputItem) {
        inputItem.consume()
      }
    }
  }

  createOutputItem() {
    throw new Error("must implement BaseProcessor#createOutputItem")
  }

  getInputItems(storageIndices) {
    if (!Array.isArray(storageIndices)) {
      storageIndices = [storageIndices]
    }
    
    const inputItems = []

    for (let i = 0; i < storageIndices.length; i++) {
      const item = this.get(storageIndices[i])
      if (item) {
        inputItems.push(item)
      }
    }

    return inputItems
  }


  getOutputItem() {
    return this.get(this.getOutputStorageIndex())
  }

  unregister() {
    super.unregister()
    this.removeProcessor()
  }

  isProcessable() {
    throw new Error("must implement BaseProcessor#isProcessable")
  }

  processInputItem() {
    let inputItems = this.getInputItems(this.getInputStorageIndices())
    if (inputItems) {
      if (this.isProcessable(inputItems)) {
        this.addProcessor()
      } else {
        this.removeProcessor()
      }
    } else {
      this.removeProcessor()
    }
  }

  addProcessor() {
    this.container.addProcessor(this)
    this.setIsProcessing(true)
  }

  removeProcessor() {
    this.container.removeProcessor(this)
    this.setIsProcessing(false)
  }

  setIsProcessing(isProcessing) {
    if (this.isProcessing !== isProcessing) {
      this.isProcessing = isProcessing
      this.onIsProcessingChanged()
    }
  }

  onIsProcessingChanged() {
    this.onStateChanged("isProcessing")
  }

  onStorageChanged(item, index) {
    super.onStorageChanged(item, index)

    // check if new input
    this.progress = 0
    this.processInputItem()
  }

  canStoreAt(index) {
    return index !== this.getOutputStorageIndex()
  }


}

module.exports = BaseProcessor