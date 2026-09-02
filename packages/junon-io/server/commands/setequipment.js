const BaseCommand = require("./base_command")
const Constants = require("../../common/constants")
const Protocol = require('../../common/util/protocol')
const Item = require("../entities/item")

class SetEquipment extends BaseCommand {
  getUsage() {
    return [
      "Sets the hand or armor equipment of a player to a certain suit or item",
      "/setequipment [armor|hand] [player] [suit_type|item_type]",
      "ex: /setequipment armor kuroro Combat_Armor"
    ]
  }

  allowOwnerOnly() {
    return true
  }

  perform(player, args) {
    const slot = args[0]
    let index

    if (slot === 'armor') {
      index = Protocol.definition().EquipmentRole.Armor
    } else if (slot === 'hand') {
      index = Protocol.definition().EquipmentRole.Hand
    } else {
      player.showChatError(this.getUsage()[0])
      return
    }

    const username = args[1]

    let type = args[2] || ""
    type = this.sector.klassifySnakeCase(type)

    // Try to find players first, then mobs (by name or ID)
    let targetEntities = this.getPlayersBySelector(username)
    if (targetEntities.length === 0) {
      // Try by numeric ID
      const id = parseInt(username)
      if (!isNaN(id)) {
        const entity = this.game.getEntity(id)
        if (entity && !entity.isPlayer()) {
          targetEntities = [entity]
        }
      }
      
      // Try by name
      if (targetEntities.length === 0) {
        const entity = this.game.getMobByName(username)
        if (entity) {
          targetEntities = [entity]
        }
      }
    }

    if (targetEntities.length === 0) {
      player.showChatError("No such player or mob: " + username)
      return
    }

    let typeId = Protocol.definition().BuildingType[type]
    if (!typeId) {
      player.showChatError("No such item: " + type)
      return
    }

    // validate proper armor/equipment
    let klass = Item.getKlass(typeId)
    if (!klass) {
      player.showChatError("No such item: " + type)
      return
    }

    if (typeof klass.prototype.isArmor !== 'function') {
      player.showChatError("invalid")
      return
    }

    if (slot === 'armor' && !klass.prototype.isArmor()) {
      player.showChatError("invalid")
      return
    }

    if (slot === 'hand' && klass.prototype.isArmor()) {
      player.showChatError("invalid")
      return
    }

    targetEntities.forEach((targetEntity) => {
      if (!targetEntity.equipments.isFullyStored()) {
        let options = {}

        const item = targetEntity.createItem(type, options)
        targetEntity.equipments.storeAt(index, item)
      }
    })


  }
}

module.exports = SetEquipment
