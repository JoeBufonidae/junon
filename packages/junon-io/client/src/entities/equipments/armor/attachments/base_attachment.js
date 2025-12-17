const BaseEntity  = require("./../../../base_entity")
const Constants = require("./../../../../../../common/constants.json")
const Protocol = require("./../../../../../../common/util/protocol")
const Helper = require("./../../../../../../common/helper")

class BaseAttachment extends BaseEntity {
  constructor(game, data) {
    super(game, data)

    this.repositionSprite()
  }

  getSprite() {
    const sprite = new PIXI.Sprite(PIXI.utils.TextureCache[this.getSpritePath()])
    return sprite
  }
  

  repositionSprite() {
    this.sprite.anchor.set(0)
    this.sprite.position.x = 0
    this.sprite.position.y = 0
    //this.sprite.rotation = Math.PI/2
  }
  getSpriteContainer() {
    return this.data.player.characterSprite
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
