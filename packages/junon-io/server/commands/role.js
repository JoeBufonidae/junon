const BaseCommand = require("./base_command")
const Constants = require("../../common/constants")
const Protocol = require('../../common/util/protocol')

class Role extends BaseCommand {
  canExecute(caller) {
    if (!caller.isPlayer()) return super.canExecute(caller)
    if (!this.isEnabled()) return caller.isAdminMode
    if (caller.isAdminMode || caller.isAdmin()) return true
    if (this.game.isMiniGame()) return false
    if (this.isNonSandboxCommand()) return true
    if (!this.game.isPeaceful()) return false
    if (caller.isSectorOwner()) return true

    let role = caller.getRole()
    return !!(role && role.isAllowedTo("ChangeRoles"))
  }

  getUsage() {
    return [
      "Assigns a role to a player",
      "/role [player] [role_name]",
      "ex: /role kuroro Admin"
    ]
  }

  allowOwnerOnly() {
    return true
  }

  perform(player, args) {
    const isPlayer = player.isPlayer()
    const fail = (msg) => { if (isPlayer) player.showChatError(msg) }

    let selector = args[0]

    let targetPlayers = this.getPlayersBySelector(selector)
    if (targetPlayers.length === 0) {
      fail("No such player ")
      return
    }

    let roleName = args[1]
    if (!roleName) {
      fail("/role [player] [rolename]")
      return
    }

    targetPlayers.forEach((targetPlayer) => {
      let targetTeam = targetPlayer.getTeam()
      if (!targetTeam) return

      // command blocks are not players: no permission checks, original behavior
      if (!isPlayer) {
        let blockRole = targetTeam.getRoleByName(roleName)
        if (blockRole) targetPlayer.setRoleType(blockRole.id)
        return
      }

      const canManageAnyTeam = player.isAdmin() || player.isSectorOwner()
      const canChangeRoles = player.getRole() &&
        player.getRole().isAllowedTo("ChangeRoles")
      if (!canManageAnyTeam && canChangeRoles &&
          String(targetPlayer.getId()) === String(player.getId())) {
        player.showChatError("Permission Denied")
        return
      }

      if (!canManageAnyTeam && canChangeRoles && targetTeam !== player.getTeam()) {
        player.showChatError("Permission Denied")
        return
      }

      let role = targetTeam.getRoleByName(roleName)
      if (!role) {
        player.showChatError("No such role " + roleName)
        return
      }

      targetTeam.setRole(targetPlayer.getId(), role.id, player)
    })
  }
}

module.exports = Role
