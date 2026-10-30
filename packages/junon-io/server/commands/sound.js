const BaseCommand = require("./base_command")
const Protocol = require("../../common/util/protocol")
const Helper = require("../../common/helper")

class Sound extends BaseCommand {
  allowOwnerOnly() {
    return true
  }

  isArgumentRequired() {
    return false
  }

  getSoundEntries() {
    const soundTypes = Protocol.definition().SoundType
    return Object.keys(soundTypes)
      .filter((name) => !/^\d+$/.test(name))
      .map((name) => ({
        name,
        normalized: Helper.camelToSnakeCase(name),
        id: soundTypes[name]
      }))
      .sort((a, b) => a.normalized.localeCompare(b.normalized))
  }

  getUsage() {
    return [
      "Play and stop command-triggered sounds.",
      "/sound list - list available sounds",
      "/sound play <sound> [range] [entityId]",
      "/sound play <sound> [range] [row] [col]",
      "/sound stop [sound] [entityId]",
      "Range and coordinates use tile units (row/column), matching /tp. Without an origin, playback is global.",
      "Examples: /sound list",
      "/sound play alert",
      "/sound play alert 20 kuroro",
      "/sound play alert 20 64 64",
      "/sound stop",
      "/sound stop alert kuroro"
    ]
  }

  normalizeSoundName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_")
  }

  findSound(value) {
    const requested = this.normalizeSoundName(value)
    return this.getSoundEntries().find((entry) => entry.normalized === requested)
  }

  showHelp(caller) {
    this.getUsage().forEach((line) => caller.showChatSuccess(line))
  }

  listSounds(caller) {
    caller.showChatSuccess("Available sounds:")
    const sounds = this.getSoundEntries().map((entry) => entry.normalized)
    for (let i = 0; i < sounds.length; i += 12) {
      caller.showChatSuccess(sounds.slice(i, i + 12).join(", "))
    }
  }

  error(caller, message) {
    if (caller && typeof caller.showChatError === "function") {
      caller.showChatError(message)
    }
  }

  getOrigin(args) {
    if (args.length === 1) {
      const entity = this.game.getEntityByNameOrId(args[0])
      if (!entity || typeof entity.getRow !== "function" || typeof entity.getCol !== "function") {
        return { error: `Could not find an entity with ID or name "${args[0]}".` }
      }
      return {
        key: `entity:${entity.id}`,
        row: entity.getRow(),
        col: entity.getCol()
      }
    }

    if (args.length === 2) {
      const row = Number(args[0])
      const col = Number(args[1])
      if (!Number.isFinite(row) || !Number.isFinite(col)) {
        return { error: "Row and column must both be valid numbers." }
      }
      return { key: `coords:${row},${col}`, row, col }
    }

    return { error: "Provide an entity ID/name or both row and column coordinates." }
  }

  clearPlaybackTimeout(instance) {
    if (instance && instance.timeout) {
      clearTimeout(instance.timeout)
      instance.timeout = null
    }
  }

  ensurePlaybackState() {
    if (!this.game.commandSoundInstances) {
      this.game.commandSoundInstances = new Map()
      this.game.nextCommandSoundId = 0
    }

    // Fallback cleanup for stale records created before the timeout was scheduled.
    const now = Date.now()
    for (const [id, instance] of this.game.commandSoundInstances) {
      if (now - instance.createdAt <= 5 * 60 * 1000) continue
      this.clearPlaybackTimeout(instance)
      instance.targets.forEach((targetPlayer) => {
        if (!instance.pendingSocketIds.has(targetPlayer.getSocketId())) return
        this.getSocketUtil().emit(targetPlayer.getSocket(), "StopCommandSound", {
          commandSoundId: id
        })
      })
      this.game.commandSoundInstances.delete(id)
    }
  }

  perform(caller, args) {
    const subcommand = String(args[0] || "").toLowerCase()

    if (!subcommand) {
      this.showHelp(caller)
      return
    }

    if (subcommand === "list") {
      this.listSounds(caller)
      return
    }

    if (subcommand === "play") {
      this.playCommandSound(caller, args.slice(1))
      return
    }

    if (subcommand === "stop") {
      this.stopCommandSounds(caller, args.slice(1))
      return
    }

    this.showHelp(caller)
  }

  playCommandSound(caller, args) {
    if (!args.length) {
      this.showHelp(caller)
      return
    }

    if (args.length > 4) {
      this.error(caller, "Too many arguments. Use /sound to see the syntax.")
      return
    }

    const sound = this.findSound(args[0])
    if (!sound) {
      this.error(caller, "Sound not available. Use /sound to list available sounds.")
      return
    }

    let range = null
    let origin = null

    if (args.length > 1) {
      range = Number(args[1])
      if (!Number.isFinite(range) || range < 0) {
        this.error(caller, "Range must be a non-negative number.")
        return
      }

      if (args.length > 2) {
        origin = this.getOrigin(args.slice(2))
        if (origin.error) {
          this.error(caller, origin.error)
          return
        }
      } else {
        this.error(caller, "No origin supplied; playing globally and ignoring the range.")
      }
    }

    const targets = []
    this.game.forEachPlayer((targetPlayer) => {
      if (range !== null && origin && this.game.distance(
        targetPlayer.getRow(),
        targetPlayer.getCol(),
        origin.row,
        origin.col
      ) > range) {
        return
      }
      targets.push(targetPlayer)
    })

    if (targets.length === 0) {
      this.error(caller, "No players were in range; no sound was played.")
      return
    }

    this.ensurePlaybackState()
    const commandSoundId = String(++this.game.nextCommandSoundId)
    const instance = {
      commandSoundId,
      soundName: sound.normalized,
      soundId: sound.id,
      originKey: origin ? origin.key : null,
      createdAt: Date.now(),
      targets,
      pendingSocketIds: new Set(targets.map((targetPlayer) => targetPlayer.getSocketId()))
    }

    this.game.commandSoundInstances.set(commandSoundId, instance)

    // Never leave a playback registered forever if a client fails to report completion.
    instance.timeout = setTimeout(() => {
      if (this.game.commandSoundInstances.get(commandSoundId) !== instance) return

      instance.targets.forEach((targetPlayer) => {
        if (!instance.pendingSocketIds.has(targetPlayer.getSocketId())) return
        this.getSocketUtil().emit(targetPlayer.getSocket(), "StopCommandSound", {
          commandSoundId
        })
      })

      this.game.commandSoundInstances.delete(commandSoundId)
      instance.timeout = null
    }, 5 * 60 * 1000)

    targets.forEach((targetPlayer) => {
      this.getSocketUtil().emit(targetPlayer.getSocket(), "PlayCommandSound", {
        id: sound.id,
        commandSoundId
      })
    })
  }

  stopCommandSounds(caller, args) {
    this.ensurePlaybackState()

    let sound = null
    let origin = null

    if (args.length > 0) {
      sound = this.findSound(args[0])
      if (!sound) {
        this.error(caller, "Sound not available. Use /sound to list available sounds.")
        return
      }
    }

    if (args.length > 1) {
      origin = this.getOrigin(args.slice(1))
      if (origin.error) {
        this.error(caller, origin.error)
        return
      }
    }

    if (args.length > 3) {
      this.error(caller, "Too many arguments. Use /sound to see the syntax.")
      return
    }

    let stopped = 0
    for (const [id, instance] of this.game.commandSoundInstances) {
      if (sound && instance.soundName !== sound.normalized) continue
      if (origin && instance.originKey !== origin.key) continue

      instance.targets.forEach((targetPlayer) => {
        if (!instance.pendingSocketIds.has(targetPlayer.getSocketId())) return
        this.getSocketUtil().emit(targetPlayer.getSocket(), "StopCommandSound", {
          commandSoundId: id
        })
      })

      this.clearPlaybackTimeout(instance)
      this.game.commandSoundInstances.delete(id)
      stopped++
    }

    caller.showChatSuccess(`Stopped ${stopped} command sound playback${stopped === 1 ? "" : "s"}.`)
  }
}

module.exports = Sound
