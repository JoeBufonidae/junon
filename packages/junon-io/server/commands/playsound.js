const BaseCommand = require("./base_command")

class Playsound extends BaseCommand {
  allowOwnerOnly() {
    return true
  }

  isArgumentRequired() {
    return false
  }

  getUsage() {
    return [
      "Play a sound for everyone in the game.",
      "/playsound <sound_name>"
    ]
  }

  perform(caller, args) {
    const soundCommand = this.game.commands && this.game.commands.sound
    if (!soundCommand) {
      caller.showChatError("The /sound command is not available.")
      return
    }

    if (!args.length) {
      this.getUsage().forEach((line) => caller.showChatSuccess(line))
      return
    }

    soundCommand.playCommandSound(caller, args)
  }
}

module.exports = Playsound
