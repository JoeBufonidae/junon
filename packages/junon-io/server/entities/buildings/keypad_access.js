const KeypadAccess = {
  setKeypadCode(player, data) {
    if (player.isAdmin() || player.isSectorOwner()) {
      if (this.sector.keyCodes[this.id]) return
      if (typeof data.keyCode !== "string") return
      if (data.keyCode.length > 10) return

      this.keyCode = data.keyCode
      this.sector.keyCodes[this.id] = { keyCode: data.keyCode }

      player.showError("Code successfully set to " + data.keyCode)
      this.getSocketUtil().emit(player.getSocket(), "KeypadSuccessful", {})
      this.getSocketUtil().emit(player.getSocket(), "DoorStatus", { status: "check code" })
    } else {
      player.showError("Must be admin", { isWarning: true })
    }
  },

  isKeypadCodeValid(player, data) {
    if (!data || !data.keyCode) return false

    const keyCode = this.sector.keyCodes[this.id]
    if (!keyCode) {
      player.showError("Code not set")
      return false
    }

    if (data.keyCode === keyCode.keyCode) return true

    this.getSocketUtil().emit(player.getSocket(), "KeypadUnsuccessful", {})
    return false
  },

  getStatus() {
    return this.sector.keyCodes[this.id] ? "check code" : "set code"
  }
}

module.exports = KeypadAccess
