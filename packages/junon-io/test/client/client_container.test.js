const ClientContainer = require('../../client/src/entities/client_container')

describe('ClientContainer terrain sync', () => {
  test('attaches the container before rendering a terrain', () => {
    const container = Object.create(ClientContainer.prototype)
    container.getColCount = () => 10
    container.renderEntity = jest.fn()

    const terrainData = { row: 3, col: 5, type: 7 }
    container.syncTerrain(terrainData)

    expect(terrainData.id).toBe('7-35')
    expect(terrainData.container).toBe(container)
    expect(container.renderEntity).toHaveBeenCalledWith(terrainData, 'terrains')
  })
})
