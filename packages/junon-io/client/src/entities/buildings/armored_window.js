const BaseBuilding = require("./base_building")
const Constants = require("./../../../../common/constants.json")
const Protocol = require("./../../../../common/util/protocol")
const Window = require("./window")

class ArmoredWindow extends Window {

  getSpritePath() {
    return 'armored_window_icon.png'
  }

  getBaseSpritePath() {
    return 'armored_window_base.png'
  }

  getPane() {
    return "armored_window_base.png"
  }
//idk why this is backwards but i gota get the update out so im not gonna bother investigating
  getBase() {
    return "armored_window.png"
  }

  getType() {
    return Protocol.definition().BuildingType.ArmoredWindow
  }

  getConstantsTable() {
    return "Buildings.ArmoredWindow"
  }

}

module.exports = ArmoredWindow