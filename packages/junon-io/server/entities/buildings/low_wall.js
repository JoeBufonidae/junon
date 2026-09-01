const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const Wall = require("./wall")

class LowWall extends Wall {
  updateRoom() {
    // dont
  }
  //maybe this ^ or this ↓ will fix mobs not shooting into other rooms through cages
  partitionRoom() {
    // dont
  }

  canBeSalvagedBy(player) {
    if (!this.isReachableFromRoom(player.getOccupiedRoom())) {
      return false
    }

    return this.isOwnedBy(player)
  }

  isPenetrable() {
    return true
  }

  getConstantsTable() {
    return "Buildings.LowWall"
  }

  getType() {
    return Protocol.definition().BuildingType.LowWall
  }

}

module.exports = LowWall
