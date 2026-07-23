const BaseEntity  = require("./../../../base_entity")
const Constants = require("./../../../../../../common/constants.json")
const Protocol = require("./../../../../../../common/util/protocol")
const Helper = require("./../../../../../../common/helper")

class BaseAttachment extends BaseEntity {
  constructor(game, data) {
    data.x = 0
    data.y = 0
    super(game, data)
    this.repositionSprite()
  }

  getSprite() {
    const sprite = new PIXI.Sprite(PIXI.utils.TextureCache[this.getSpritePath()])
    sprite.width = this.getWidth()
    sprite.height = this.getHeight()
    return sprite
  }
  

  repositionSprite() {
      this.sprite.anchor.set(0)
      this.sprite.position.x = 0
      this.sprite.position.y = 0

    }


  getSpriteContainer() {
      if (this.data.user.isBuildingType()) {
          return this.data.user.buildingSprite
      } else {
          return this.data.user.characterSprite
      }
  }
 
  

  onPostEquip() {

  }

  syncWithServer() {
    
  }

  static getSellGroup() {
    return "Attachments"
  }

  static build(game, data) {
    return new this(game, data)
  }

  getType() {
    throw new Error("must implement BaseAttachment.getType")
  }

}

module.exports = BaseAttachment
