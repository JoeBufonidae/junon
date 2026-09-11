const LandMob = require("./land_mob")
const Protocol = require("./../../../common/util/protocol")
const Constants = require("./../../../common/constants.json")
const Projectiles = require('./../projectiles/index')
const EquipmentInventory = require("./../equipment_inventory")
const Needs = require("./../../../common/interfaces/needs")
const NeedsServer = require("../../interfaces/needs")

class Human extends LandMob {

  preApplyData() {
    this.initNeeds()
    this.initEquipment()
  }

  initEquipment() {
    this.equipments = new EquipmentInventory(this, 4)
  }

  setHandItem(item) {
    this.equipments.storeAt(Protocol.definition().EquipmentRole.Hand, item)
    this.onStateChanged("weaponType")
  }

  onEquipmentStorageChanged(item, index) {
    if (index === Protocol.definition().EquipmentRole.Hand) {
      if (this.getHandItem() && !this.getHandItem().isBuilding()) {
        this.weaponType = this.getHandItem().getType()
      } else {
        this.weaponType = Protocol.definition().BuildingType.None
      }
      this.onStateChanged("weaponType")
    }

    if (item && item.getOwner() !== this) {
      item.setOwner(this)
    }

    this.onStateChanged("equipments")
    
  }

  setArmorItem(item) {
    this.equipments.storeAt(Protocol.definition().EquipmentRole.Armor, item)
  }

  getArmorItem() {
    return this.equipments.get(Protocol.definition().EquipmentRole.Armor)
  }

  getHandItem() {
    return this.equipments.get(Protocol.definition().EquipmentRole.Hand)
  }

  getArmorEquip() {
    const item = this.getArmorItem()
    return item && item.instance
  }

  getArmorEquipment() {
    return this.getArmorEquip()
  }

  getHandEquipment() {
    const item = this.getHandItem()
    return item && item.instance
  }

  changeSuitColor(color) {
    let equipment = this.getArmorEquipment()
    if (equipment && equipment.getType() === Protocol.definition().BuildingType.SpaceSuit) {
      equipment.setContent(color)
      this.onStateChanged("equipments")
    }
  }

  getType() {
    return Protocol.definition().MobType.Human
  }

  getConstantsTable() {
    return "Mobs.Human"
  }

}

Object.assign(Human.prototype, Needs.prototype, {
  onSleepStateChanged(){
    this.onStateChanged("isSleeping")
  },
  onHungerZero() {
    // this.setHealth(this.health - 2)
  },
  onOxygenChanged() {
    this.onStateChanged("oxygen")
  },
  onStaminaChanged() {
    this.onStateChanged("stamina")
  },
  onHungerChanged() {
    this.onStateChanged("hunger")
  },
  onHappinessChanged() {
    this.onStateChanged("happiness")
  },
  getMaxOxygen() {
    return this.getStats().oxygen
  }
})

Object.assign(Human.prototype, NeedsServer.prototype, {
  getHungerReduceInterval() {
    return 8
  }
})

module.exports = Human
