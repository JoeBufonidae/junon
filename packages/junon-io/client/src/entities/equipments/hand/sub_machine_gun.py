const RangeEquipment = require("./range_equipment")
const Constants = require("./../../../../../common/constants.json")
const Protocol = require("./../../../../../common/util/protocol")

class Pistol extends RangeEquipment {

  getSpritePath() {
    return 'sub_machine_gun.png'
  }

  getType() {
    return Protocol.definition().BuildingType.SubMachineGun
  }

  getConstantsTable() {
    return "Equipments.SubMachineGun"
  }

}

module.exports = SubMachineGun
