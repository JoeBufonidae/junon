const Constants = require('../../../common/constants.json')
const Protocol = require('../../../common/util/protocol')
const BaseBuilding = require("./base_building")

class SuitStation extends BaseBuilding {

  unregister() {
    super.unregister()
    this.container.removeProcessor(this)
  }

  // switch armors
  interact(user) {
    if (this.game.isMiniGame() && this.game.sector.miniGame.name === 'find_the_imposter') {
      return 
    }

    if (!this.canBeInteracted(user)) {
      user.showError("That doesnt belong to you")
      return
    }

    // putting a suit on or taking one off takes time (a fraction of it at a suit station, see getEquipDelaySettings)
    if (user.isPlayer() && !user.isSwappingAtSuitStation) {
      const wornArmor = user.getArmorItem()
      const storedArmor = this.get(0)
      if (wornArmor || storedArmor) {
        const seconds = user.getArmorSwapSeconds(storedArmor, wornArmor, user.getEquipDelaySettings().suitStationMultiplier)
        const started = user.startEquipDelay(
          seconds,
          () => {
            user.isSwappingAtSuitStation = true
            try {
              this.interact(user)
            } finally {
              user.isSwappingAtSuitStation = false
            }
          },
          () => { return user.getArmorItem() === wornArmor && this.get(0) === storedArmor }
        )
        if (started) return
      }
    }

    let playerArmorItem = user.retrieveArmorItem()
    let storedArmorItem = this.retrieve(0)

    if (playerArmorItem) {
      this.store(playerArmorItem)
      this.changeOwnership(user)
    }

    if (storedArmorItem) {
      user.setArmorItem(storedArmorItem)
      if (user.isPlayer()) {
        user.walkthroughManager.handle("suit_station")
      }
      this.changeOwnershipToTeam(user.getTeam())
    }
  }

  changeOwnershipToTeam(team) {
    if (this.owner) {
      this.owner.unregisterOwnership("structures", this)
    }
    
    this.setOwner(team)

    team.registerOwnership("structures", this)
  }

  changeOwnership(user) {
    if (!user.isPlayer()) return

    if (this.owner) {
      this.owner.unregisterOwnership("structures", this)
    }
    
    this.setOwner(user)

    user.registerOwnership("structures", this)
  }

  canBeInteracted(player) {
    if (!this.owner) return true

    if (this.owner.isPlayer() || this.owner.isPlayerData()) {
      let isAdminOfTeam = this.owner.getTeam() === player.getTeam() && player.isAdmin()
      if (isAdminOfTeam) return true

      return this.owner === player
    } else {
      return player.hasOwnership(this)
    }
  }

  canBeSalvagedBy(player) {
    if (!this.canBeInteracted(player)) return false

    return super.canBeSalvagedBy(player)
  }

  // ---- Tuning: refilling the suit stored in the station ----
  getRefillSettings() {
    return {
      oxygenPerInterval: 6, // oxygen added to the stored suit every 3 second oxygen tick
      ratio: 1              // oxygen taken from the connected network for each oxygen the suit gains
    }
  }

  executeTurn() {
    const isThreeSecondInterval = this.game.timestamp % (Constants.physicsTimeStep * Constants.oxygenProductionConsumptionRate) === 0
    if (!isThreeSecondInterval) return

    let item = this.get(0)
    if (!this.isOxygenItem(item)) return

    const equipment = item.instance
    const settings = this.getRefillSettings()
    const ratio = settings.ratio > 0 ? settings.ratio : 1

    // a full suit takes nothing
    const wanted = Math.min(settings.oxygenPerInterval, equipment.getUnfilledOxygen())
    if (!(wanted > 0)) return

    // no touching oxygen pipe, tank or generator: no refill, and the room's air is never used
    const networks = this.getConnectedOxygenNetworks()
    if (networks.length === 0) return

    const taken = this.drainOxygenFromNetworks(networks, Math.ceil(wanted * ratio))
    const gained = Math.min(wanted, Math.floor(taken / ratio))
    if (gained > 0) {
      equipment.increaseOxygen(gained)
    }
  }

  // the oxygen networks of the pipes, tanks and generators touching this station
  getConnectedOxygenNetworks() {
    const grids = [this.container.structureMap, this.container.gasDistributionMap].filter((grid) => { return !!grid })
    const networks = {}

    const top = this.getTopLeftRow()
    const left = this.getTopLeftCol()
    const bottom = top + this.getRowCount()
    const right = left + this.getColCount()

    const touchingTiles = []
    for (let col = left; col < right; col++) {
      touchingTiles.push([top - 1, col])
      touchingTiles.push([bottom, col])
    }
    for (let row = top; row < bottom; row++) {
      touchingTiles.push([row, left - 1])
      touchingTiles.push([row, right])
    }

    touchingTiles.forEach((tile) => {
      grids.forEach((grid) => {
        const entity = grid.get(tile[0], tile[1])
        if (entity && entity !== this && entity.oxygenNetwork) {
          networks[entity.oxygenNetwork.id] = entity.oxygenNetwork
        }
      })
    })

    return Object.values(networks)
  }

  // takes oxygen out of the tanks on these networks; returns how much was taken
  drainOxygenFromNetworks(networks, amount) {
    let remaining = amount

    networks.forEach((network) => {
      Object.values(network.storages || {}).forEach((hit) => {
        if (remaining <= 0) return

        const storage = hit.entity
        const take = Math.min(storage.getResourceStored("oxygen"), remaining)
        if (take > 0) {
          const drained = storage.consumeResource("oxygen", take)
          remaining -= (typeof drained === "number" ? drained : 0)
        }
      })
    })

    return amount - remaining
  }

  isOxygenItem(item) {
    if (!item) return false
    return item.instance && item.instance.hasOxygen()
  }

  getConstantsTable() {
    return "Buildings.SuitStation"
  }

  getType() {
    return Protocol.definition().BuildingType.SuitStation
  }

  getStorageContentType() {
    let item = this.get(0)
    if (!item) return ""

    let suitColor = item.instance && item.instance.content 
    if (suitColor) {
      return [item.type.toString(),suitColor].join(":")
    } else {
      return item.type.toString()
    }
  }

  canStore(index, item) {
    if (!item) return true // allow swap with blank space slot

    return item.isArmor()
  }

  store(item) {
    // to prevent non-armors from being stored
    if(item.isArmor()) {
      super.store(item)
    } else {
      return
    }
  }

  onStorageChanged(item, index) {
    super.onStorageChanged(item, index)

    this.setBuildingContent(this.getStorageContentType())
    
    this.onStateChanged("content")

    let storedItem = this.get(0)
    if (this.isOxygenItem(storedItem)) {
      this.container.addProcessor(this)
    } else {
      this.container.removeProcessor(this)
    }
  }

}

module.exports = SuitStation
