const Protocol = require("../../../common/util/protocol")
const SteelCrate = require("./steel_crate")
const KeypadAccess = require("./keypad_access")

const STORAGE_ACCESS_WINDOW_MS = 10000

class Safe extends SteelCrate {
  getConstantsTable() {
    return "Buildings.Safe"
  }

  getType() {
    return Protocol.definition().BuildingType.Safe
  }

  setKeypadCode(player, data) {
    KeypadAccess.setKeypadCode.call(this, player, data)
  }

  checkKeypadCode(player, data) {
    if (!KeypadAccess.isKeypadCodeValid.call(this, player, data)) return

    this.keypadViewAuthorizations = this.keypadViewAuthorizations || {}
    this.keypadViewAuthorizations[player.id] = Date.now() + STORAGE_ACCESS_WINDOW_MS
    this.getSocketUtil().emit(player.getSocket(), "KeypadSuccessful", {})
  }

  getStatus(player) {
    return KeypadAccess.getStatus.call(this, player)
  }

  isKeypadProtectedStorage() {
    return true
  }

  authorizeStorageView(player) {
    const expiresAt = this.keypadViewAuthorizations && this.keypadViewAuthorizations[player.id]
    if (this.keypadViewAuthorizations) {
      delete this.keypadViewAuthorizations[player.id]
    }
    return typeof expiresAt === "number" && expiresAt >= Date.now()
  }

  hasKeypadStorageAccess(player) {
    return this.viewSubscribers && this.viewSubscribers[player.id] === player
  }

  remove() {
    delete this.sector.keyCodes[this.id]
    super.remove()
  }
}

module.exports = Safe
