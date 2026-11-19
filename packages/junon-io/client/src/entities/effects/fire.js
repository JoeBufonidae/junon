const BaseEffect = require("./base_effect")
const Constants = require("./../../../../common/constants.json")
const ClientHelper = require("./../../util/client_helper")
const HealthBar = require("./../../components/health_bar")

// Smoke from burning buildings. Edit the numbers, then rebuild the client.
const FIRE_SMOKE = {
  COLOR: 0x555555,        // smoke color (dark gray)
  MIN_SIZE: 20,           // smallest puff size in pixels
  MAX_SIZE: 50,           // biggest puff size in pixels
  DRIFT_X: 1.5,           // how far a puff drifts sideways, in tiles
  DRIFT_Y: -3,            // how far a puff drifts up (negative = up), in tiles
  CHANCE_PER_FRAME: 0.1,   // chance each on-screen burning building makes a puff every frame (1 = every frame, 0.1 = about 6 per second)
}

// Burning buildings get a red tint for as long as they burn.
const BURN_TINT = {
  COLOR: 0xff6d6d,        // color of the red layer drawn over a burning building
  ALPHA: 0.55,            // how strong the red is (0 = invisible, 1 = solid)
}

// Damage indicators for burning buildings: each one on screen shows a floating -1 once a second.
const DAMAGE_INDICATOR = {
  SHOW_NUMBER: true,       // floating red -1
}

// Smoke and indicators run from one shared timer for the whole world. Only burning buildings on screen do any work.
const smokeEmitters = []
let smokeTimer = null
let lastIndicatorAt = 0

const VIEW_MARGIN_TILES = 3   // smoke and indicators also run this many tiles past the screen edge

// The part of the world currently on screen, in world coordinates.
function getViewBounds(game) {
  const renderer = game.app.renderer
  const width = renderer.screen ? renderer.screen.width : renderer.width
  const height = renderer.screen ? renderer.screen.height : renderer.height
  const margin = Constants.tileSize * VIEW_MARGIN_TILES
  const left = -game.cameraDisplacement.x / game.resolution
  const top = -game.cameraDisplacement.y / game.resolution
  return {
    left: left - margin,
    top: top - margin,
    right: left + width / game.resolution + margin,
    bottom: top + height / game.resolution + margin
  }
}

function isInView(entity, view) {
  const x = entity.getX()
  const y = entity.getY()
  return x >= view.left && x <= view.right && y >= view.top && y <= view.bottom
}

function startSmokeTimer() {
  if (smokeTimer) return
  smokeTimer = new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 1000)
      .onUpdate(() => {
        if (smokeEmitters.length === 0) return

        const now = Date.now()
        const showIndicators = now - lastIndicatorAt >= 1000
        if (showIndicators) lastIndicatorAt = now

        const view = getViewBounds(smokeEmitters[0].game)
        for (let i = 0; i < smokeEmitters.length; i++) {
          const effect = smokeEmitters[i]
          if (!isInView(effect.affectedEntity, view)) continue
          if (Math.random() < FIRE_SMOKE.CHANCE_PER_FRAME) effect.emitSmokePuff()
          if (showIndicators) effect.showDamageIndicator()
        }
      })
      .repeat(Infinity)
  smokeTimer.start()
}

class Fire extends BaseEffect {

  getConstantsTable() {
    return "Effects.Fire"
  }

  onPostInit() {
    if (this.sprite && this.affectedEntity.isTerrain()) {
      this.sprite.position.set(this.affectedEntity.getX(), this.affectedEntity.getY())
    }

    this.onLevelChanged(1)
    this.applyBurnTint()
    this.startMapRed()
    this.startSmoke()
  }  

  isTargetCorpse() {
    const e = this.affectedEntity
    if (!e) return false
    if (typeof e.isCorpse === "function" && e.isCorpse()) return true
    return typeof e.getGroup === "function" && e.getGroup() === "corpses"
  }

  shouldEmitSmoke() {
    // buildings and floors only: not players, mobs or terrain
    return !this.isTargetLivingEntity() && !this.affectedEntity.isTerrain()
  }

  startSmoke() {
    if (!this.shouldEmitSmoke()) return
    if (typeof this.smokeIndex !== "undefined") return

    this.smokeIndex = smokeEmitters.length
    smokeEmitters.push(this)
    startSmokeTimer()
  }

  stopSmoke() {
    if (typeof this.smokeIndex === "undefined") return

    const last = smokeEmitters.pop()
    if (last !== this) {
      smokeEmitters[this.smokeIndex] = last
      last.smokeIndex = this.smokeIndex
    }
    this.smokeIndex = undefined

    if (smokeEmitters.length === 0 && smokeTimer) {
      smokeTimer.stop()
      smokeTimer = null
    }
  }

  applyBurnTint() {
    const entity = this.affectedEntity
    if (this.isTargetLivingEntity() || entity.isTerrain()) return
    if (this.burnOverlay) return
    if (!entity.sprite) return

    // Prefer a copy of the building's own picture, so the red follows its real outline.
    // The copy is a child of that sprite, so it shares its size, position and rotation.
    // some buildings keep their picture in baseSprite and use buildingSprite as an empty container, so take the first one that has a picture
    const hasPicture = (sprite) => sprite && sprite.texture && sprite.texture !== PIXI.Texture.EMPTY && sprite.anchor
    const source = [entity.buildingSprite, entity.baseSprite, entity.characterSprite].find(hasPicture)
    // a corpse with no picture to copy gets no overlay (a plain rectangle would not match its shape)
    if (!source && this.isTargetCorpse()) return
    const canCopy = !!source

    let overlay
    if (canCopy) {
      overlay = new PIXI.Sprite(source.texture)
      overlay.anchor.set(source.anchor.x, source.anchor.y)
      source.addChild(overlay)
    } else {
      // no picture to copy: fall back to a rectangle the size of the building as it appears on screen
      overlay = new PIXI.Sprite(PIXI.Texture.WHITE)
      overlay.anchor.set(0.5)
      const hasRotated = typeof entity.getRotatedWidth === "function" && typeof entity.getRotatedHeight === "function"
      overlay.width = hasRotated ? entity.getRotatedWidth() : entity.getWidth()
      overlay.height = hasRotated ? entity.getRotatedHeight() : entity.getHeight()
      overlay.rotation = -entity.sprite.rotation
      entity.sprite.addChild(overlay)
    }

    overlay.name = "burnOverlay"
    overlay.tint = BURN_TINT.COLOR
    overlay.alpha = BURN_TINT.ALPHA
    this.burnOverlay = overlay
  }

  // Keeps the burning building's map tiles red for as long as it burns (painted once, restored once).
  startMapRed() {
    const entity = this.affectedEntity
    if (this.mapRedTiles) return
    if (this.isTargetLivingEntity() || this.isTargetCorpse() || entity.isTerrain()) return
    const mapMenu = this.game.mapMenu
    if (!mapMenu || typeof mapMenu.flashTileStart !== "function") return

    const tileSize = Constants.tileSize
    let row, col, rows, cols
    if (typeof entity.getUpperLeftRow === "function" && typeof entity.getRotatedHeight === "function") {
      row = entity.getUpperLeftRow()
      col = entity.getUpperLeftCol()
      rows = Math.max(1, Math.ceil(entity.getRotatedHeight() / tileSize))
      cols = Math.max(1, Math.ceil(entity.getRotatedWidth() / tileSize))
    } else {
      row = Math.floor(entity.getY() / tileSize)
      col = Math.floor(entity.getX() / tileSize)
      rows = 1
      cols = 1
    }

    this.mapRedTiles = { row: row, col: col, rows: rows, cols: cols }
    for (let r = row; r < row + rows; r++) {
      for (let c = col; c < col + cols; c++) {
        mapMenu.flashTileStart(r, c)
      }
    }
  }

  stopMapRed() {
    const tiles = this.mapRedTiles
    this.mapRedTiles = undefined
    if (!tiles) return
    const mapMenu = this.game.mapMenu
    if (!mapMenu || typeof mapMenu.flashTileEnd !== "function") return

    for (let r = tiles.row; r < tiles.row + tiles.rows; r++) {
      for (let c = tiles.col; c < tiles.col + tiles.cols; c++) {
        mapMenu.flashTileEnd(r, c)
      }
    }
  }

  removeBurnTint() {
    const overlay = this.burnOverlay
    this.burnOverlay = undefined
    if (!overlay) return

    try {
      if (overlay.parent) overlay.parent.removeChild(overlay)
      overlay.destroy()
    } catch (e) {
      // sprite may already be gone
    }
  }

  showDamageIndicator() {
    const entity = this.affectedEntity
    if (!entity || entity.isRemoved) return
    if (this.isTargetCorpse()) return
    if (typeof entity.dontShowHealth === "function" && entity.dontShowHealth()) return

    if (DAMAGE_INDICATOR.SHOW_NUMBER) HealthBar.showDamageTaken(entity, -1)
  }

  emitSmokePuff() {
    this.game.createSmoke({
      x: this.affectedEntity.getX(),
      y: this.affectedEntity.getY() - Constants.tileSize / 2,
      color: FIRE_SMOKE.COLOR,
      minWidth: FIRE_SMOKE.MIN_SIZE,
      maxWidth: FIRE_SMOKE.MAX_SIZE,
      moveTo: { x: Constants.tileSize * FIRE_SMOKE.DRIFT_X, y: Constants.tileSize * FIRE_SMOKE.DRIFT_Y }
    })
  }

  onLevelChanged(level) {
    if (!this.sprite) return
    this.setSize(level)
    this.reinitTween()
  }

  setSize(level) {
    let size = (level / this.getMaxEffectLevel()) * Constants.tileSize
    this.sprite.width  = size
    this.sprite.height = size
  }

  remove() {
    this.removeBurnTint()
    this.stopMapRed()
    this.stopSmoke()
    super.remove()
  }

  reinitTween() {
    if (this.tween) {
      this.tween.stop()
    }

    this.tween = this.getAnimationTween()
    this.tween.start()
  }

  getAnimationTween() {
    const origWidth = this.sprite.width
    const maxExpansion = 10
    const desiredWidth = origWidth + maxExpansion
    let width = { width: origWidth }
    const widthToShiftPosition = origWidth 
    const amountToShift = (Constants.tileSize * 2) / origWidth + 5 // the smaller it is,  the more it shift around
    const origX = this.getX()
    const origY = this.getY()
    const shouldShift = !this.isTargetLivingEntity()
    const tweenSpeed = this.isTargetLivingEntity() ? 300 : 1000

    var tween = new TWEEN.Tween(width)
        .to({ width: desiredWidth }, tweenSpeed)
        .onUpdate(() => {
          if (shouldShift && width.width === widthToShiftPosition) {
            let randomX = amountToShift/2 - Math.floor(Math.random() * amountToShift)
            let randomY = amountToShift/2 - Math.floor(Math.random() * amountToShift)
            this.sprite.position.set(origX + randomX, origY + randomY)
          }
          this.sprite.width = width.width
          this.sprite.height = width.width
        })
        .yoyo(true)
        .repeat(Infinity)

    return tween
  }


}

module.exports = Fire
