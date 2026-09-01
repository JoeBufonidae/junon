const BaseCommand = require("./base_command")
const Constants = require("../../common/constants")
const Protocol = require('../../common/util/protocol')

class Speed extends BaseCommand {
  getUsage() {
    return [
      "Sets the speed of an entity to a certain value",
      "/speed [player] [1-50]",
      "ex: /speed kuroro 20"
    ]
  }

  allowOwnerOnly() {
    return true
  }

  perform(player, args) {
    const selector = args[0]
    const speed = parseInt(args[1])

    let targetPlayers = this.getPlayersBySelector(selector) 
    if (targetPlayers.length === 0) {
      player.showChatError("no players found")
      return
    }

    if (isNaN(speed) || speed < 0 || speed > 50) {
      player.showChatError("/speed [1-50]")
      return
    }

    targetPlayers.forEach((targetPlayer) => {
      targetPlayer.speed = speed
    })
  }

}

module.exports = Speed