const BaseCommand = require("./base_command")

class Zoom extends BaseCommand {
  getUsage() {
    return [
      "Sets the zoom level of a player",
      "/zoom set [player] [amount]",
      "/zoom gain [player] [amount]",
      "/zoom lose [player] [amount]",
      "ex: /zoom set kuroro 2",
    ]
  }

  allowOwnerOnly() {
    return true
  }

  perform(caller, args) {
    const subcommand = args[0]
    const selector = args[1]
    const targets = this.getEntitiesBySelector(selector).filter(entity => entity.isPlayer())

    if (targets.length === 0) {
      caller.showChatError("No such player: " + selector)
      return
    }

    const amount = Number(args[2])
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10) {
      caller.showChatError("Invalid zoom amount: " + args[2])
      return
    }

    if (!["set", "gain", "lose"].includes(subcommand)) {
      caller.showChatError("No such subcommand " + subcommand)
      return
    }

    targets.forEach(player => {
      const customStats = this.sector.entityCustomStats[player.id] || {}
      const minZoom = customStats.minZoom != null ? customStats.minZoom : (player.minZoom || 0.5)
      const maxZoom = customStats.maxZoom != null ? customStats.maxZoom : (player.maxZoom || 3)
      const currentZoom = Number.isFinite(player.zoomLevel) ? player.zoomLevel : 1

      let level = amount
      if (subcommand === "gain") level = currentZoom + amount
      if (subcommand === "lose") level = currentZoom - amount

      level = Math.max(minZoom, Math.min(maxZoom, level))
      player.emitSocket("SetZoom", { level, minZoom, maxZoom })
      player.zoomLevel = level
    })
  }
}

module.exports = Zoom
