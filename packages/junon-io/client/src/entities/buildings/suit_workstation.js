const BaseBuilding = require("./base_building")
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
    this.armorEquipContainer.pivot.y = Constants.tileSize / 2 - 28
    this.armorEquipContainer.rotation = Math.PI
    this.armorEquipContainer.scale.x = 3.0
    this.armorEquipContainer.scale.y = 3.0
    sprite.addChild(this.armorEquipContainer)

    this.attachmentContainer = new PIXI.Container()
    this.attachmentContainer.name = "Attachment"
    this.attachmentContainer.pivot.x = Constants.tileSize / 2 + 35
    this.attachmentContainer.pivot.y = Constants.tileSize / 2 - 25
    this.attachmentContainer.rotation = 90 * Math.PI
    this.attachmentContainer.scale.x = 2.5
    this.attachmentContainer.scale.y = 2.5
    sprite.addChild(this.attachmentContainer)


    return sprite
  }

  getConstantsTable() {
    return "Buildings.SuitWorkstation"
  }

  getSuitStorageIndices() {
    return [0, 3]
  }

  onContentChanged() {
    // Remove existing armor
    if (this.armor) {
      this.armor.remove()
      this.armor = null
    }

    // Remove existing attachment
    if (this.attachment) {
      this.attachment.remove()
      this.attachment = null
    }

    if (!this.content) return

    const parts = this.content.split(":")
    const suitType = parts[0]
    const color = parts[1]
    const attachmentType = parts[2]

    // Build armor if one exists
    if (suitType) {
      const armorData = {
        x: 0,
        y: 0,
        user: this,
        instance: {
          content: color
        }
      }

      this.armor = Equipments.forType(suitType).build(this.game, armorData)
    }

    // Build attachment if one exists
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
  }

  openMenu() {
    let options = {}
    this.game.processorMenu.open(
      "Suit Workstation",
      this,
      this.getMenuDescription(),
      false,
      "",
      options
    )
  }

  onPostEquip() {
    // Listen for alteration success
    this.game.socketUtil.on("SuitAlterationSuccess", (data) => {
      if (data.armorId) {
        this.game.showNotification("Suit alteration successful!")
        // Optionally update local armor data
      }
    })
  }
}

module.exports = SuitWorkstation