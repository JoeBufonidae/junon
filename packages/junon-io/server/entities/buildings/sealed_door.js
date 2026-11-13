const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const BaseBuilding = require("./base_building")
const Airlock = require("./airlock")
const Team = require("../team")

class SealedDoor extends Airlock {

  onBuildingPlaced() {
    super.onBuildingPlaced()

    this.setIsCustomAccess(true)
  }

  setIsCustomAccess() {
    super.setIsCustomAccess(true)
  }

  shouldInheritCustomAccess() {
    return false
  }

  getDefaultAccessType() {
    let result = 0

    result += (1 << Team.SlaveRoleType)

    const isTeam = (entity) => entity && typeof entity.isTeam === "function" && entity.isTeam()
    let ownerTeam = this.owner
    if (!isTeam(ownerTeam) && this.owner && typeof this.owner.getTeam === "function") {
      ownerTeam = this.owner.getTeam()
    }

    if (isTeam(ownerTeam)) {
      for (let id in ownerTeam.roles) {
        result += (1 << parseInt(id))
      }
    }

    return result
  }

  getConstantsTable() {
    return "Buildings.SealedDoor"
  }

  getType() {
    return Protocol.definition().BuildingType.SealedDoor
  }

  isAutomatic() {
    return false
  }

  interact(user) {
    if (!this.isAllowedToPass(user)) {
      user.showError("Access Denied")
      return
    }

    super.interact(user)
  }

  canBeSalvagedBy(player) {
    const role = player.getRole()
    if (role && role.isAllowedTo("DeconstructOwnedStructures") || player.isSectorOwner()) {
      return super.canBeSalvagedBy(player)
    } else {
      return false
    }
  }

  isAllowedToPass(entity) {
    if (!this.isOwnedBy(entity)) return false
      
    if (entity.isPlayer()) {
      return this.isRolePermitted(entity.roleType)
    } else if (entity.hasCategory("worker")) {
      return this.isRolePermitted(Team.SlaveRoleType)
    } else {
      return true
    }
  }

  shouldObstruct(body, hit) {
    return !this.isOpen
  }


}

module.exports = SealedDoor
