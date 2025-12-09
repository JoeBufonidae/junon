// filepath: c:\Users\tmdjr\junon\packages\junon-io\client\src\entities\buildings\suit_workstation.js
const BaseBuilding = require("./base_building");
const Protocol = require("./../../../../common/util/protocol");

class SuitWorkstation extends BaseBuilding {
  constructor(game, data, isEquipDisplay) {
    super(game, data, isEquipDisplay);
    this.slots = {
      armor: null,
      attachment: null,
      magnet: null,
    };
  }

  openMenu() {
    this.game.processorMenu.open("Suit Workstation", this, this.getMenuDescription());
  }
  setArmor(armor) {
    this.slots.armor = armor;
    this.updateMenu();
  }

  setAttachment(attachment) {
    this.slots.attachment = attachment;
    this.updateMenu();
  }

  setMagnet(magnet) {
    this.slots.magnet = magnet;
    this.updateMenu();
  }

  updateMenu() {
    // Update the UI to reflect the current slots
  }

  processAlteration() {
    const { armor, attachment, magnet } = this.slots;

    if (!this.validateInput(armor, attachment, magnet)) {
      return;
    }

    // Send request to server to perform the alteration
    this.sendAlterationRequest(armor, attachment, magnet);
  }

  validateInput(armor, attachment, magnet) {
    // Validate that armor has open slots, attachment is valid, and magnet tier is correct
    return true; // Placeholder for actual validation logic
  }

  sendAlterationRequest(armor, attachment, magnet) {
    // Logic to send the alteration request to the server
  }

  getType() {
    return Protocol.definition().BuildingType.SuitWorkstation;
  }
}

module.exports = SuitWorkstation;