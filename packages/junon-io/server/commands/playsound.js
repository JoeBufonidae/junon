const BaseCommand = require("./base_command")
const Protocol = require("../../common/util/protocol")
const Helper = require("../../common/helper")

class Playsound extends BaseCommand {
  getUsage() {
    const soundTypes = Protocol.definition().SoundType
    const sounds = Object.keys(soundTypes)
      .filter((name) => !/^\d+$/.test(name))
      .map((name) => Helper.camelToSnakeCase(name))
      .sort()

    const soundLines = []
    for (let i = 0; i < sounds.length; i += 12) {
      soundLines.push(sounds.slice(i, i + 12).join(", "))
    }

    return [
      "Plays a sound for everyone in the game",
      "/playsound [sound_name]",
      "Example: /playsound alert",
      "Available sounds:",
      ...soundLines
    ]
  }

  allowOwnerOnly() {
    return true
  }

  perform(player, args) {
    const requestedName = String(args[0] || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_")

    const soundTypes = Protocol.definition().SoundType
    const soundName = Object.keys(soundTypes).find((name) =>
      !/^\d+$/.test(name) &&
      Helper.camelToSnakeCase(name) === requestedName
    )
    const soundId = soundName === undefined ? undefined : soundTypes[soundName]

    if (soundId === undefined) {
      player.showChatError("Sound not available. Use /playsound to list available sounds.")
      return
    }

    this.game.forEachPlayer((targetPlayer) => {
      this.getSocketUtil().emit(targetPlayer.getSocket(), "PlaySound", { id: soundId })
    })
  }
}

module.exports = Playsound
