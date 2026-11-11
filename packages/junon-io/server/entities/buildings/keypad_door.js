const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const BaseBuilding = require("./base_building")
const Airlock = require("./airlock")
const Team = require("../team")
const KeypadAccess = require("./keypad_access")

class KeypadDoor extends Airlock {
    onBuildingPlaced() {
        super.onBuildingPlaced()
    }

    getDefaultAccessType() {
        let result = 0

        result += (1 << Team.SlaveRoleType)

        return result
    }

    getConstantsTable() {
        return "Buildings.KeypadDoor"
    }

    getType() {
        return Protocol.definition().BuildingType.KeypadDoor
    }

    isAutomatic() {
        return false
    }

    interact(user) {
        //wait for keypad usage instead
    }

    isPassableByPathFinder() {
        return false
    }

    canBeSalvagedBy(player) {
        if (player.isSectorOwner()) {
            return super.canBeSalvagedBy(player)
        } else {
            player.showError("Wait for the map owner to break this door",  {isWarning: true})
            return false
        }
    }

    isAllowedToPass(entity) {
        if(entity.isMob()) return false
        
        else return true
    }

    shouldObstruct(body, hit) {
        return !this.isOpen
    }

    remove() {
        delete this.sector.keyCodes[this.id]
        super.remove()
    }

    setKeypadCode(player, data) {
        KeypadAccess.setKeypadCode.call(this, player, data)
    }

    checkKeypadCode(player, data) {
        if (!KeypadAccess.isKeypadCodeValid.call(this, player, data)) return

        if(this.isOpen) this.close()
        else this.open()

        this.getSocketUtil().emit(player.getSocket(), "KeypadSuccessful", {})

        setTimeout(() => {
            this.close()
        }, 3000)
    }

    getStatus(player) {
        return KeypadAccess.getStatus.call(this, player)
    }
}

module.exports = KeypadDoor