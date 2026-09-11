const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const Wall = require("./wall")
const Window = require("./window")

class ArmoredWindow extends Window {

  getConstantsTable() {
    return "Buildings.ArmoredWindow"
  }

  getType() {
    return Protocol.definition().BuildingType.ArmoredWindow
  }

}

module.exports = ArmoredWindow
