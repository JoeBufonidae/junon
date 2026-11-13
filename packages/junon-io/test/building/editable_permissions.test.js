const RemoteEventHandler = require('../../server/entities/remote_event_handler')

describe('editable building permissions', () => {
  test('applies a role permission change when the player has ChangeRoles', () => {
    const building = {
      isOwnedBy: () => true,
      hasCategory: (category) => category === 'editable_permissions',
      editPermission: jest.fn(),
    }
    const player = {
      game: { getEntity: () => building },
      getRole: () => ({ isAllowedTo: (permission) => permission === 'ChangeRoles' }),
      setLastCustomAccess: jest.fn()
    }

    new RemoteEventHandler({}).onEditBuilding(player, {
      id: 'building',
      roleType: '1',
      isRoleEnabled: false
    })

    expect(building.editPermission).toHaveBeenCalledWith('1', false)
    expect(player.setLastCustomAccess).toHaveBeenCalledWith(building)
  })

  test('does not apply role permission changes without ChangeRoles', () => {
    const building = {
      isOwnedBy: () => true,
      hasCategory: (category) => category === 'editable_permissions',
      editPermission: jest.fn(),
    }
    const player = {
      game: { getEntity: () => building },
      getRole: () => ({ isAllowedTo: () => false }),
      setLastCustomAccess: jest.fn()
    }

    new RemoteEventHandler({}).onEditBuilding(player, {
      id: 'building',
      roleType: '1',
      isRoleEnabled: false
    })

    expect(building.editPermission).not.toHaveBeenCalled()
    expect(player.setLastCustomAccess).not.toHaveBeenCalled()
  })
})
