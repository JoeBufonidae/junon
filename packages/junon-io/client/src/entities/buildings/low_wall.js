const Constants = require("./../../../../common/constants.json")
const Protocol = require("./../../../../common/util/protocol")
const Tilable = require("./../../../../common/interfaces/tilable")
const Wall = require("./wall")

class LowWall extends Wall {

  layoutTile(tiles = this.getSides(), targetSprite = this.getTileSprite()) {
    const sideTiles = {
      up: !!tiles.up,
      down: !!tiles.down,
      left: !!tiles.left,
      right: !!tiles.right
    }

    const numOfSides = Object.values(sideTiles).filter(Boolean).length
    const textures = this.getTextures()

    switch (numOfSides) {
      case 4:
        targetSprite.texture = textures.line_four
        break

      case 3:
        targetSprite.texture = textures.line_three
        targetSprite.rotation = this.getConduitRotation(sideTiles)
        break

      case 2:
        targetSprite.texture = textures[
          this.isStraightLine(sideTiles)
            ? "line_two_straight"
            : "line_two"
        ]
        targetSprite.rotation = this.getConduitRotation(sideTiles)
        break

      case 1:
        targetSprite.texture = textures.line_one
        targetSprite.rotation = this.getConduitRotation(sideTiles)
        break

      case 0:
        targetSprite.texture = textures.line_zero
        targetSprite.rotation = 0
        break
    }
  }

  getWallColor() {
    return 0x2a2a2a
  }

  hasEdgeSprite() {
    return true
  }


  getBaseSpritePath() {
    return "wall.png"
  }

  getBuildingSprite() {
    let buildingSprite = super.getBuildingSprite()

    this.baseSprite.width = Constants.tileSize
    this.baseSprite.height = Constants.tileSize

    return buildingSprite
  }

  getType() {
    return Protocol.definition().BuildingType.LowWall
  }

  getConstantsTable() {
    return "Buildings.LowWall"
  }

}

module.exports = LowWall