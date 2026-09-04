const BaseBuilding = require("./base_building")
const Constants = require("./../../../../common/constants.json")
const Protocol = require("./../../../../common/util/protocol")
const Wall = require("./wall")

class Window extends Wall {

  redrawSprite() {

  }

  getSpritePath() {
    return 'window_icon.png'
  }

  getBaseSpritePath() {
    return 'window_base.png'
  }

  getPane() {
    return "window.png"
  }

  getBase() {
    return "window_base.png"
  }

  getBuildingSprite() {
    let sprite = new PIXI.Container()
    let pane = this.getPane()
    let base = this.getBase()

    this.baseSprite = this.createSprite(
      PIXI.utils.TextureCache[pane]
    )

    this.baseSprite.name = "WallBaseSprite"
    this.baseSprite.anchor.set(0.5)
    this.baseSprite.width = Constants.tileSize
    this.baseSprite.height = Constants.tileSize
    this.baseSprite.tint = this.getWallColor()

    if (this.data.hasOwnProperty("colorIndex")) {
      if (this.game.colors[this.data.colorIndex]) {
        this.baseSprite.tint = this.game.colors[this.data.colorIndex].value
      } else {
        this.baseSprite.tint = this.data.colorIndex - 38
      }
    }

    this.windowSprite = this.createSprite(
      PIXI.utils.TextureCache[base]
    )

    this.windowSprite.name = "WindowSprite"
    this.windowSprite.anchor.set(0.5)
    this.windowSprite.width = Constants.tileSize
    this.windowSprite.height = Constants.tileSize

    sprite.name = [this.constructor.name, "building"].join("_")
    sprite.addChild(this.windowSprite)
    sprite.addChild(this.baseSprite)

    return sprite
  }

  setColorIndex(colorIndex) {
    this.colorIndex = colorIndex

    if (!this.baseSprite) return

    if (this.game.colors[colorIndex]) {
      this.baseSprite.tint = this.game.colors[colorIndex].value
    } else {
      this.baseSprite.tint = colorIndex - 38
    }
  }

  getType() {
    return Protocol.definition().BuildingType.Window
  }

  getConstantsTable() {
    return "Buildings.Window"
  }

}

module.exports = Window