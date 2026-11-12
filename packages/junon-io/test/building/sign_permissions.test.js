const RemoteEventHandler = require('../../server/entities/remote_event_handler')

function createSign(isCustomAccess, isRolePermitted) {
  return {
    id: 'sign',
    content: 'old',
    isCustomAccess,
    isOwnedBy: () => true,
    hasEditableContent: () => true,
    hasCategory: (category) => category === 'sign',
    isRolePermitted,
    getMaxContentLength: () => 100,
    setBuildingContent(content) {
      this.content = content
    }
  }
}

function editSign(sign, canEditSign) {
  const player = {
    game: { getEntity: () => sign },
    roleType: 2,
    getRole: () => ({ isAllowedTo: () => canEditSign }),
    replaceBadWords: (content) => content,
    showError: jest.fn()
  }

  new RemoteEventHandler({}).onEditBuilding(player, {
    id: sign.id,
    content: 'new'
  })

  return player
}

describe('sign custom permissions', () => {
  test('custom role permission allows editing without EditSign', () => {
    const sign = createSign(true, jest.fn(() => true))
    const player = editSign(sign, false)

    expect(sign.isRolePermitted).toHaveBeenCalledWith(player.roleType)
    expect(sign.content).toEqual('new')
    expect(player.showError).not.toHaveBeenCalled()
  })

  test('custom role permission denies editing despite EditSign', () => {
    const sign = createSign(true, jest.fn(() => false))
    const player = editSign(sign, true)

    expect(sign.content).toEqual('old')
    expect(player.showError).toHaveBeenCalledWith('Permission Denied', { isWarning: true })
  })

  test('uses EditSign when custom permissions are disabled', () => {
    const sign = createSign(false, jest.fn())
    const player = editSign(sign, true)

    expect(sign.isRolePermitted).not.toHaveBeenCalled()
    expect(sign.content).toEqual('new')
    expect(player.showError).not.toHaveBeenCalled()
  })
})
