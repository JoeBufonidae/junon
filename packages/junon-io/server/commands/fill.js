const BaseCommand = require("./base_command")
const Constants = require("../../common/constants")
const Protocol = require('../../common/util/protocol')
const Region = require("../entities/region")
const Terrains = require("../entities/terrains/index")
const Buildings = require("../entities/buildings/index")

class Fill extends BaseCommand {
  getUsage() {
    return [
      "Fills an area with the chosen terrain or building",
      "/fill [start_row] [start_col] [end_row] [end_col] [terrain_type] [color]",
      "/fill building [start_row] [start_col] [end_row] [end_col] [1x1 building] [color]",
      "ex: /fill 1 1 5 5 floor",
    ]
  }
  //maybe add a arguement to make it so fill platform doesnt delete structures
  allowOwnerOnly() {
    return true
  }

  perform(player, args) {

    // /fill building
    if (args[0] == 'building') {
      let startRow = parseInt(args[1])
      let startCol = parseInt(args[2])
      let endRow   = parseInt(args[3])
      let endCol   = parseInt(args[4])
      let type     = args[5]

      if (!Region.isBoundsValid(this.sector, startRow, startCol, endRow, endCol)) {
        player.showChatError("Invalid bounds")
        return
      }

      if (!type) {
        player.showChatError("Must specify building type")
        return
      }

      const klassName = this.sector.klassifySnakeCase(type)
      let klass = Buildings[klassName]

      if (!klass) {
        player.showChatError("Invalid building type")
        return
      }

      if (klass.prototype.hasCategory("platform")) {
        player.showChatError("You cannot fill with platforms")
        return
      }

      if (Constants.Buildings[klassName]) {
        if (
          Constants.Buildings[klassName].width != Constants.tileSize ||
          Constants.Buildings[klassName].height != Constants.tileSize
        ) {
          player.showChatError('Building must be 1x1')
          return
        }
      }

      this.sector.roomManager.isAllocationDisabled = true

      for (var row = startRow; row <= endRow; row++) {
        for (var col = startCol; col <= endCol; col++) {

          // Only remove the existing structure.
          // Floor, platform, distribution, armor, fuel, gas,
          // and liquid layers are left untouched.
          this.sector.removeStructures(row, col)

          let x = col * Constants.tileSize + Constants.tileSize / 2
          let y = row * Constants.tileSize + Constants.tileSize / 2
          let w = Constants.tileSize
          let h = Constants.tileSize

          let data = {
            angle: 0,
            type: klass.getType(),
            x: x,
            y: y,
            w: w,
            h: h,
            owner: player.getBuildOwner(),
            placer: player
          }

          let building = klass.build(data, this.sector)

          if (building && building.hasCustomColors()) {

            if (args[6] && Constants.FloorColors[args[6]]) {
              building.setColorIndex(Constants.FloorColors[args[6]].index)
            } else {
              if (player.colorIndex >= 0) {
                building.setColorIndex(player.colorIndex)
              }
            }
          }
        }
      }

      this.sector.roomManager.isAllocationDisabled = false
      return
    }

    // Normal /fill
    let startRow = parseInt(args[0])
    let startCol = parseInt(args[1])
    let endRow   = parseInt(args[2])
    let endCol   = parseInt(args[3])

    // auto invert coords to make it valid
    // if (startRow > endRow) {
    //   let tempRow = startRow
    //   startRow = endRow
    //   endRow = tempRow
    // }
    //
    // if (startCol > endCol) {
    //   let tempCol = startCol
    //   startCol = endCol
    //   endCol = tempCol
    // }

    let type = args[4]

    if (!Region.isBoundsValid(this.sector, startRow, startCol, endRow, endCol)) {
      player.showChatError("Invalid bounds")
      return
    }

    if (!type) {
      player.showChatError("Must specify terrain type")
      return
    }

    let klassName = this.sector.klassifySnakeCase(type)

    if (klassName === "Meteorite") {
      klassName = "MeteoriteAsteroid"
    }
    
    let klass = Terrains[klassName]
    let buildingklass = Buildings[klassName]
    let isPlatform = false

    if (!klass) {
      if (buildingklass && buildingklass.prototype.hasCategory("platform")) {
        klass = buildingklass
        isPlatform = true
      } else {
        player.showChatError("Invalid terrain type")
        return
      }
    }

    let data

    this.sector.roomManager.isAllocationDisabled = true

    for (var row = startRow; row <= endRow; row++) {
      for (var col = startCol; col <= endCol; col++) {

        // Normal /fill behavior:
        // remove the existing terrain.
        let existingTerrain = this.sector.groundMap.get(row, col)

        if (existingTerrain) {
          existingTerrain.remove({ removeAll: true })
        }

        // Normal /fill removes all building layers.
        this.sector.removeAllBuildings(row, col)

        let x = col * Constants.tileSize + Constants.tileSize / 2
        let y = row * Constants.tileSize + Constants.tileSize / 2
        let w = Constants.tileSize
        let h = Constants.tileSize

        data = {
          angle: 0,
          type: klass.getType(),
          x: x,
          y: y,
          w: w,
          h: h
        }

        if (isPlatform) {
          data.owner = player.getBuildOwner()
          data.placer = player
        }
      
        let building = klass.build(data, this.sector)

        if (building && building.hasCustomColors()) {

          if (args[5] && Constants.FloorColors[args[5]]) {
            building.setColorIndex(Constants.FloorColors[args[5]].index)
          } else {
            if (player.colorIndex >= 0) {
              building.setColorIndex(player.colorIndex)
            }

            if (player.textureIndex >= 0) {
              building.setTextureIndex(player.textureIndex)
            }
          }
        }
      }
    }

    this.sector.roomManager.isAllocationDisabled = false
  }
}

module.exports = Fill