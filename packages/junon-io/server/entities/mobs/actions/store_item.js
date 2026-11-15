const BaseAction = require("./base_action")

class StoreItem extends BaseAction {
  perform(options) {
    let entity = this.planner.entity
    let item = options.item
    let wasInHand = entity.getHandItem() === item

    entity.equipments.removeItem(item)
    let stored = options.storage.store(item)

    if (!stored) {
      // leftover that did not fit stays with the slave, the next planning pass finds another crate for it
      if (wasInHand) {
        entity.setHandItem(item)
      } else {
        entity.setExtraItem(item)
      }
    }

    // if only the extra item is left, move it to the hand so the planner sees it
    let extra = entity.getExtraItem()
    if (!entity.getHandItem() && extra) {
      entity.equipments.removeItem(extra)
      entity.setHandItem(extra)
    }
  }

  shouldCompleteAfterPerform() {
    return true
  }

}

module.exports = StoreItem
