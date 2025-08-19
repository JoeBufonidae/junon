const BaseEquipment = require("./../base_equipment")
const Protocol = require('../../../../common/util/protocol')
const Attachments = require('./attachments')

class ArmorEquipment extends BaseEquipment {
  constructor(item, options) {
    super(item, options);
    this.attachments = []; // Store attachment objects here
    this.combinedStats = null; // cache for merged stats
  }

  // -------- Attachment management --------

  /**
   * Add an attachment if not already installed
   * @param {Object} attachment - { id: string, modifiers: { stat: number, ... } }
   * @returns {boolean} true if added, false if already present
   */
  addAttachment(attachment) {
    if (this.attachments.find(a => a.id === attachment.id)) {
      return false; // already installed
    }
    this.attachments.push(attachment);
    this.updateStatsFromAttachments();
    return true;
  }

  /*
   * Remove attachment by id
   * @param {string} attachmentId
   * @returns {boolean} true if removed, false if not found
   */
  removeAttachment(attachmentId) {
    const index = this.attachments.findIndex(a => a.id === attachmentId);
    if (index === -1) return false;
    this.attachments.splice(index, 1);
    this.updateStatsFromAttachments();
    return true;
  }

  /**
   * Calculate combined stats: base stats + attachment modifiers
   */
  updateStatsFromAttachments() {
    // Clone base stats from constants
    if (!Array.isArray(this.attachments)) this.attachments = [];
    
    let combined = { ...this.getConstants().stats };

    for (const att of this.attachments) {
      if (att.modifiers) {
        for (const stat in att.modifiers) {
          if (combined[stat] === undefined) combined[stat] = 0;
          combined[stat] += att.modifiers[stat];
        }
      }
    }

    this.combinedStats = combined;
  }

  /**
   * Override getStats to include attachment modifiers
*/
  getStats() {
    if (!this.combinedStats) {
      this.updateStatsFromAttachments();
    }
    return this.combinedStats || super.getStats();
  }
 
  // -------- Existing methods unchanged --------

  applyVelocity(player, velocity) {
    player.body.velocity = velocity // by default, set immediately
  }

  reduceDamage(amount, sourceEntity) {
    if (sourceEntity && sourceEntity.hasCategory("elemental")) {
      return amount
    }

    let newAmount = amount - this.getDefense()
    if (newAmount < 0) newAmount = 0

    return newAmount
  }

  getDefense() {
    return this.getStats().defense || 0
  }

  use(player, targetEntity, options = {}) {
    return true
  }

  getDampingFactor() {
    return 0.8 // by default
  }

  hasOxygen() {
    return false
  }

  isArmor() {
    return true
  }

  getRole() {
    return Protocol.definition().EquipmentRole.Armor
  }

  getImmunity() {
    return []
  }

  getOxygen() {
    return this.oxygen
  }

  setOxygen(oxygen, player) {
    let prevOxygen = this.oxygen
    if (oxygen > this.getMaxOxygen()) {
      this.oxygen = this.getMaxOxygen()
    } else if (oxygen < 0) {
      this.oxygen = 0
    } else {
      this.oxygen = oxygen
    }

    if (prevOxygen !== this.oxygen) {
      this.onOxygenChanged(oxygen, player)
    }
  }

  getUnfilledOxygen() {
    return this.getMaxOxygen() - this.oxygen
  }

  onOxygenChanged(oxygen, user) {
    if (!user) return
    if (!user.isPlayer()) return

    let player = user

    // client instances equipments using the item id..
    let data = {
      entityId: this.item.getId(),
      oxygen: oxygen
    }

  //  this.getSocketUtil().emit(player.getSocket(), "UpdateStats", data)
  }

  getMaxOxygen() {
    return this.getConstants().stats.oxygen
  }

  onEquipmentConstructed() {
    this.oxygen = this.getMaxOxygen()
 //   this.updateStatsFromAttachments()
  }

  onStorageChanged(storage) {
    if (storage.isInventory()) {
      if (storage.user && storage.user.isPlayer()) {
        // this is so that client would immediaely see oxygen change in bar..
        storage.user.forceOxygenConsumption()
      }
    } else {
      // equipped to building
      if (this.owner && !this.owner.isSector()) {
        this.owner.onOxygenChanged()
      }
    }
  }

  increaseOxygen(amount) {
    this.setOxygen(this.getOxygen() + amount, this.getOwner())
  }

  applyVelocity(player, velocity) {
    if (player.isDirectionKeysHeld()) {
      player.accelerate(velocity)
    }
  }
}

module.exports = ArmorEquipment
