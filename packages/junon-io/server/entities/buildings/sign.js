const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const BaseBuilding = require("./base_building")

class Sign extends BaseBuilding {

  setBuildingContent(content, editor) {
    let oldContent = this.content
    if (this.content !== content) {
      this.content = content
      this.setLastEdit(editor)
      this.onBuildingContentChanged(oldContent, this.content)
    }
  }

  // editor = the player who changed it; anything else (command blocks) is recorded as "Command Blocks"
  setLastEdit(editor) {
    if (editor && typeof editor.isPlayer === "function" && editor.isPlayer()) {
      this.lastEditBy = editor.getName()
    } else {
      this.lastEditBy = "Command Blocks"
    }
    this.lastEditAt = Math.floor(Date.now() / 1000)
    this.onStateChanged("lastEditBy")
    this.onStateChanged("lastEditAt")
  }

  setHealth(newHealth) {
    if (this.game.isPvP()) return super.setHealth(newHealth)

    // cannot be damaged in non-pvp
  }

  getConstantsTable() {
    return "Buildings.Sign"
  }

  getType() {
    return Protocol.definition().BuildingType.Sign
  }
  
  isCollidable() {
    return false
  }

}

module.exports = Sign
