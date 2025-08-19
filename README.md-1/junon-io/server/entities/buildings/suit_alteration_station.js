class SuitAlterationStation {
  constructor() {
    this.slots = {
      armor: null, // Slot for armor with open attachment slots
      attachment: null, // Slot for the attachment
      magnet: null // Slot for the magnet (if necessary)
    };
  }

  // Validate the input for the alteration process
  validateInput() {
    if (!this.slots.armor) {
      throw new Error("No armor placed in the first slot.");
    }
    if (!this.slots.attachment) {
      throw new Error("No attachment placed in the second slot.");
    }
    if (this.slots.magnet && !this.isMagnetCompatible()) {
      throw new Error("Magnet is not compatible with the armor or attachment.");
    }
    if (!this.hasOpenAttachmentSlot()) {
      throw new Error("No open attachment slots available on the armor.");
    }
  }

  // Check if the magnet is compatible with the armor and attachment
  isMagnetCompatible() {
    const armorTier = this.slots.armor.getTier();
    const attachmentTier = this.slots.attachment.tier;
    const magnetTier = this.slots.magnet.tier;

    return magnetTier >= Math.max(armorTier, attachmentTier);
  }

  // Check if there are open attachment slots on the armor
  hasOpenAttachmentSlot() {
    return this.slots.armor.getOpenAttachmentSlots() > 0;
  }

  // Process the alteration
  processAlteration() {
    this.validateInput();

    // Add the attachment to the armor
    this.slots.armor.addAttachment(this.slots.attachment);

    // If a magnet is provided, use it
    if (this.slots.magnet) {
      this.useMagnet();
    }

    return true; // Indicate successful alteration
  }

  // Use the magnet for the alteration
  useMagnet() {
    // Logic to consume the magnet
    this.slots.magnet = null; // Remove the magnet after use
  }

  // Set the slots for the alteration
  setSlots(armor, attachment, magnet) {
    this.slots.armor = armor;
    this.slots.attachment = attachment;
    this.slots.magnet = magnet;
  }
}

module.exports = SuitAlterationStation;