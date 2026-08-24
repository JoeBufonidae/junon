const BaseCommand = require("./base_command")
const Constants = require("../../common/constants")
const Region = require("../entities/region")
const Buildings = require("../entities/buildings/index")

class SetStructure extends BaseCommand {

  getUsage() {
    return [
      "Places a structure at a specified position",
      "/setstructure [structure] [row] [col] [rotation]",
      "ex: /setstructure Forge 10 20 1",
    ]
  }

  allowOwnerOnly() {
    return true
  }

  perform(player, args) {
    const type = args[0]

    if (!type) {
      player.showChatError("Must specify structure type")
      return
    }

    const anchorRow = parseInt(args[1])
    const anchorCol = parseInt(args[2])

    if (isNaN(anchorRow) || isNaN(anchorCol)) {
      player.showChatError("Invalid row or column")
      return
    }

    // Rotation defaults to 1.
    const rotation = args[3] ? parseInt(args[3]) : 1

    if (isNaN(rotation) || rotation < 1 || rotation > 4) {
      player.showChatError("Rotation must be between 1 and 4")
      return
    }

    const angles = {
    1: -90,
    2: 180,
    3: 90,
    4: 0
    }

    const angle = angles[rotation]

    const klassName = this.sector.klassifySnakeCase(type)
    const klass = Buildings[klassName]

    if (!klass) {
      player.showChatError("Invalid structure type")
      return
    }

    const width = klass.getRotatedWidth(angle)
    const height = klass.getRotatedHeight(angle)

    if (
      width <= 0 ||
      height <= 0 ||
      width % Constants.tileSize !== 0 ||
      height % Constants.tileSize !== 0
    ) {
      player.showChatError("Invalid structure footprint")
      return
    }

    const rowCount = height / Constants.tileSize
    const colCount = width / Constants.tileSize

    /*
     * Convert the supplied anchor into the footprint's top-left tile.
     *
     *              TOP
     *
     *       1                4
     *       TL ┌────────────┐ TR
     *          │            │
     *          │            │
     *       BL └────────────┘ BR
     *       2                3
     *
     * The anchor is always one of the four corners of the
     * rotated footprint. This will be changed if we get negative feedback about the current
     */
    let topLeftRow
    let topLeftCol

    switch (rotation) {
      case 1:
        // Top-left
        topLeftRow = anchorRow
        topLeftCol = anchorCol
        break

      case 2:
        // Bottom-left
        topLeftRow = anchorRow - rowCount + 1
        topLeftCol = anchorCol
        break

      case 3:
        // Bottom-right
        topLeftRow = anchorRow - rowCount + 1
        topLeftCol = anchorCol - colCount + 1
        break

      case 4:
        // Top-right
        topLeftRow = anchorRow
        topLeftCol = anchorCol - colCount + 1
        break
    }

    const endRow = topLeftRow + rowCount - 1
    const endCol = topLeftCol + colCount - 1

    if (!Region.isBoundsValid(
      this.sector,
      topLeftRow,
      topLeftCol,
      endRow,
      endCol
    )) {
      player.showChatError("Structure footprint is out of bounds")
      return
    }

    /*
     * The building's x/y remain its CENTER.
     *
     * The command's row/col are the anchor, but BaseBuilding expects
     * x/y to represent the center of its footprint.
     */
    const x =
      topLeftCol * Constants.tileSize +
      width / 2

    const y =
      topLeftRow * Constants.tileSize +
      height / 2


    this.sector.roomManager.isAllocationDisabled = true

    try {
      for (let row = topLeftRow; row <= endRow; row++) {
        for (let col = topLeftCol; col <= endCol; col++) {
          this.sector.removeStructures(row, col)
        }
      }

      const buildingConstants = Constants.Buildings[klassName]

      const data = {
        type: klass.getType(),

        angle: angle,
        origAngle: angle,

        x: x,
        y: y,

        w: buildingConstants
          ? buildingConstants.width
          : width,

        h: buildingConstants
          ? buildingConstants.height
          : height,

        owner: player.getBuildOwner(),
        placer: player
      }

      const building = klass.build(data, this.sector)

      if (building && building.hasCustomColors()) {
        if (player.colorIndex >= 0) {
          building.setColorIndex(player.colorIndex)
        }

        if (player.textureIndex >= 0) {
          building.setTextureIndex(player.textureIndex)
        }
      }

    } finally {
      this.sector.roomManager.isAllocationDisabled = false
    }
  }
}

module.exports = SetStructure