const RoleCommand = require('../../server/commands/role')

function createRoleCommand(isPeaceful = true) {
  const command = Object.create(RoleCommand.prototype)
  command.game = {
    isMiniGame: () => false,
    isPeaceful: () => isPeaceful
  }
  return command
}

function createPlayer(rolePermissions = {}) {
  return {
    isPlayer: () => true,
    isAdminMode: false,
    isAdmin: () => false,
    isSectorOwner: () => false,
    getId: () => 'actor',
    getRole: () => ({
      isAllowedTo: (permission) => !!rolePermissions[permission]
    })
  }
}

describe('ChangeRoles permission', () => {
  test('allows the role command when ChangeRoles is enabled', () => {
    const command = createRoleCommand()
    const player = createPlayer({ ChangeRoles: true })

    expect(command.canExecute(player)).toEqual(true)
  })

  test('does not let UseCommands alone assign roles', () => {
    const command = createRoleCommand()
    const player = createPlayer({ UseCommands: true })

    expect(command.canExecute(player)).toEqual(false)
  })

  test("limits ChangeRoles assignments to the player's own team", () => {
    const command = createRoleCommand()
    const ownTeam = { setRole: jest.fn() }
    const otherTeam = {
      getRoleByName: jest.fn(),
      setRole: jest.fn()
    }
    const player = Object.assign(createPlayer({ ChangeRoles: true }), {
      getTeam: () => ownTeam,
      showChatError: jest.fn()
    })
    const target = {
      getTeam: () => otherTeam,
      getId: () => 'target'
    }
    command.getPlayersBySelector = () => [target]

    command.perform(player, ['target', 'Member'])

    expect(otherTeam.setRole).not.toHaveBeenCalled()
    expect(player.showChatError).toHaveBeenCalledWith('Permission Denied')
  })

  test('does not let ChangeRoles users reassign themselves', () => {
    const command = createRoleCommand()
    const ownTeam = {
      getRoleByName: jest.fn(() => ({ id: 2 })),
      setRole: jest.fn()
    }
    const player = Object.assign(createPlayer({ ChangeRoles: true }), {
      getTeam: () => ownTeam,
      showChatError: jest.fn()
    })
    const target = {
      getTeam: () => ownTeam,
      getId: () => 'actor'
    }
    command.getPlayersBySelector = () => [target]

    command.perform(player, ['@s', 'Admin'])

    expect(ownTeam.setRole).not.toHaveBeenCalled()
    expect(player.showChatError).toHaveBeenCalledWith('Permission Denied')
  })
})
