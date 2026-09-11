const BaseBuilding = require("./base_building")
const SocketUtil = require("./../../util/socket_util")
const Protocol = require("./../../../../common/util/protocol")
const Constants = require("./../../../../common/constants.json")
const Equipments = require("./../equipments/index")
const Attachments = require("./../equipments/armor/attachments")


class SuitWorkstation extends BaseBuilding {
  constructor(game, data, isEquipDisplay) {
    super(game, data, isEquipDisplay)
    this.slotCount = 3
  }

  getType() {
    return Protocol.definition().BuildingType.SuitWorkstation
  }

  getSpritePath() {
    return "suit_workstation.png"
  }

  getBuildingSprite() {
    const texture = PIXI.utils.TextureCache[this.getSpritePath()]

    let sprite = this.createSprite(texture)
    sprite.name = [this.constructor.name, "building"].join("_")

    sprite.anchor.set(0.5)
    sprite.scale.y = this.getYScale()
    sprite.scale.x = this.getXScale()

    if (!this.shouldUseOriginalWidth()) {
      sprite.width = this.getDisplayWidth()
      sprite.height = this.getDisplayHeight()
    }

    this.baseSprite = sprite

    this.armorEquipContainer = new PIXI.Container()
    this.armorEquipContainer.name = "ArmorEquipment"
    this.armorEquipContainer.pivot.x = Constants.tileSize / 2
    this.armorEquipContainer.pivot.y = Constants.tileSize / 2 + 5
    this.armorEquipContainer.rotation = Math.PI
    this.armorEquipContainer.scale.x = 1.8
    this.armorEquipContainer.scale.y = 1.8
    sprite.addChild(this.armorEquipContainer)

    this.attachmentContainer = new PIXI.Container()
    this.attachmentContainer.name = "Attachment"
    this.attachmentContainer.pivot.x = Constants.tileSize / 2 + 37
    this.attachmentContainer.pivot.y = Constants.tileSize / 2 - 65
    this.attachmentContainer.rotation = 90 * Math.PI
    this.attachmentContainer.scale.x = 1.8
    this.attachmentContainer.scale.y = 1.8
    sprite.addChild(this.attachmentContainer)


    return sprite
  }

  getConstantsTable() {
    return "Buildings.SuitWorkstation"
  }

  getSuitStorageIndices() {
    return [0, 3]
  }

  openMenu() {
    this.game.suitWorkstationMenu.open(this)
  }
  
  updateStorageInventory(data) {
    super.updateStorageInventory(data)

    if (this.game.suitWorkstationMenu) {
      const armor = this.storage && this.storage[0]

      if (
        armor &&
        armor.instance &&
        Array.isArray(armor.instance.attachments)
      ) {
        const types = armor.instance.attachments
          .map(attachment => {
            if (typeof attachment.getType === "function") {
              return attachment.getType()
            }

            return attachment.type || attachment.id
          })
          .filter(type => type !== undefined && type !== null)

        this.game.suitWorkstationMenu.updateInstalledAttachments(types)
      }
    }
  }

  onContentChanged() {
    if (this.armor) {
      this.armor.remove()
      this.armor = null
    }

    if (this.attachment) {
      this.attachment.remove()
      this.attachment = null
    }

    if (!this.content) {
      if (this.game.suitWorkstationMenu) {
        this.game.suitWorkstationMenu.updateInstalledAttachments([])
      }
      return
    }

    const parts = this.content.split(":")
    const suitType = parts[0]
    const color = parts[1]
    const attachmentType = parts[2]
    const installedAttachmentTypes =
      parts.length > 3 && parts[3]
        ? parts[3].split(",").filter(Boolean)
        : []

    if (suitType) {
      const armorData = {
        x: 0,
        y: 0,
        user: this,
        instance: {
          content: color
        }
      }

      this.armor = Equipments.forType(suitType).build(
        this.game,
        armorData
      )
    }

    if (attachmentType) {
      const attachmentData = {
        x: 0,
        y: 0,
        user: this
      }

      this.attachment = Attachments
        .forType(attachmentType)
        .build(this.game, attachmentData)
    }

    if (this.game.suitWorkstationMenu) {
      this.game.suitWorkstationMenu.updateInstalledAttachments(
        installedAttachmentTypes
      )
    }
  }

  getStorageContentType() {
    const outputIndex = (typeof this.getOutputStorageIndex === "function")
      ? this.getOutputStorageIndex()
      : 3

    const armor = this.get(0)
    const attachment = this.get(1)

    if (!armor && !attachment) return ""

    const armorType = armor ? armor.type.toString() : ""
    const suitColor = armor && armor.instance
      ? armor.instance.content
      : ""

    const color = suitColor || ""
    const attachmentType = attachment
      ? attachment.getType().toString()
      : ""

    let installedAttachments = ""

    if (armor && Array.isArray(armor.attachments)) {
      installedAttachments = armor.attachments.map(attachment => {
        if (typeof attachment.getType === "function") {
          return attachment.getType()
        }

        return attachment.type || attachment.id
      }).filter(type => type !== undefined && type !== null).join(",")
    }

    return [armorType, color, attachmentType, installedAttachments].join(":")
  }

  onPostEquip() {
    this.game.socketUtil.on("SuitAlterationSuccess", (data) => {
      if (data.armorId) {
        this.game.showNotification("Suit alteration successful!")
      }
    })
  }
}

module.exports = SuitWorkstation