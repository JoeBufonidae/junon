const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const Wall = require("./wall")
const LowWall = require("./low_wall")

class Window extends Wall {
  updateRoom() {
    // dont
  }
  partitionRoom() {
    // dont
  }

  isCollidable(entity) {
    return true
  }

  canBeSalvagedBy(player) {
    if (!this.isReachableFromRoom(player.getOccupiedRoom())) {
      return false
    }

  return this.isOwnedBy(player)
  }

  remove() {
    if (this.isDismantled) {
      super.remove()
      return
    }

    let colorIndex = this.colorIndex
    let x = this.getX()
    let y = this.getY()
    let owner = this.getTeam()

    super.remove()

    let data = {
      x: x,
      y: y,
      owner: owner,
      colorIndex: colorIndex,
    }

    LowWall.build(data, this.container)
  }

  getConstantsTable() {
    return "Buildings.Window"
  }

  getType() {
    return Protocol.definition().BuildingType.Window
  }

}

module.exports = Window
