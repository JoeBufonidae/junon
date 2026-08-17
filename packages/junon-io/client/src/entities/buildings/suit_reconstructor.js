const BaseBuilding = require("./base_building")
const Protocol = require("../../../../common/util/protocol")
const Constants = require("../../../../common/constants.json")
const Equipments = require("../equipments/index")

class SuitReconstructor extends BaseBuilding {
  constructor(game, data, isEquipDisplay) {
    super(game, data, isEquipDisplay)
    this.slotCount = 3
  }

  getType() {
    return Protocol.definition().BuildingType.SuitReconstructor
  }

  getSpritePath() {
    return "suit_reconstructor.png"
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
    this.armorEquipContainer.pivot.x = Constants.tileSize / 2 + 1
    this.armorEquipContainer.pivot.y = Constants.tileSize / 2 + 3.5
    this.armorEquipContainer.rotation = Math.PI
    this.armorEquipContainer.scale.x = 7.5
    this.armorEquipContainer.scale.y = 7.5
    sprite.addChild(this.armorEquipContainer)

    return sprite
  }

  getConstantsTable() {
    return "Buildings.SuitReconstructor"
  }

  getSuitStorageIndices() {
    return [0, 3]
  }

  onContentChanged() {
    const armorType = this.content
    if (armorType) {
      let suitType = armorType.split(":")[0]
      let color = armorType.split(":")[1]

      let data = { x: 0, y: 0, user: this }
      data.instance = {
        content: color
      }

      this.armor = Equipments.forType(suitType).build(this.game, data)
    } else if (this.armor) {
      // no more armor in storage, remove it
      this.armor.remove()
    }
  }

  openMenu() {
    let options = {}
    this.game.processorMenu.open(
      "Suit Repairer",
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

module.exports = SuitReconstructor