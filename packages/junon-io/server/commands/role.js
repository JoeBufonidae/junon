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
    let selector = args[0]

    let targetPlayers = this.getPlayersBySelector(selector)
    if (targetPlayers.length === 0) {
      player.showChatError("No such player ")
      return
    }

    let roleName = args[1] 
    if (!roleName) {
      player.showChatError("/role [player] [rolename]")
      return
    }

    targetPlayers.forEach((targetPlayer) => {
      let role = targetPlayer.getTeam().getRoleByName(roleName)
      if (!role) {
        player.showChatError("No such role " + roleName)
        return
      }

      targetPlayer.setRoleType(role.id)
    })
  }
}

module.exports = Role
