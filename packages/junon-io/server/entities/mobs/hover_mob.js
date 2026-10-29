const BaseMob = require("./base_mob")
const Constants = require('../../../common/constants.json')

class HoverMob extends BaseMob {

  getLineOfSightRange() {
    return this.getStats(this.getLevel()).los
  }

  getAttackPositionSearchRings() {
    return 6
  }

  getAttackPositionStuckTimeout() {
    return null
  }

  isPathFindTargetReachable() {
    return true
  }

  triggerTraps() {
    // flying done trigger traps
  }

  hasClearShotFrom(x, y, target) {
    const container = this.getContainer()
    const targetX = container.isMovable() ? target.getRelativeX() : target.getX()
    const targetY = container.isMovable() ? target.getRelativeY() : target.getY()
    const distance = this.game.distance(x, y, targetX, targetY)
    const obstacle = container.raycast(x, y, targetX, targetY, distance, this)

    if (!obstacle || obstacle.entity === target) return true
    if (!obstacle.entity.isCollidable()) return true

    return this.game.distance(x, y, obstacle.x, obstacle.y) >= distance
  }

  getClearAttackPosition(target) {
    const container = this.getContainer()
    const isMovable = container.isMovable()
    const sourceX = isMovable ? this.getRelativeX() : this.getX()
    const sourceY = isMovable ? this.getRelativeY() : this.getY()

    if (this.obstructedAttackPositionTarget !== target) {
      this.obstructedAttackPositionTarget = target
      this.obstructedAttackPosition = null
      this.lastObstructedAttackPositionSearch = null
      this.rejectedObstructedAttackPositions = []
      this.obstructedAttackPositionProgressTarget = null
    }

    const cached = this.obstructedAttackPosition
    if (cached && this.hasClearShotFrom(cached.x, cached.y, target)) {
      return cached
    }

    this.obstructedAttackPosition = null

    const searchInterval = Constants.physicsTimeStep
    if (this.lastObstructedAttackPositionSearch !== null &&
        this.lastObstructedAttackPositionSearch !== undefined &&
        this.game.timestamp - this.lastObstructedAttackPositionSearch < searchInterval) {
      return null
    }

    this.lastObstructedAttackPositionSearch = this.game.timestamp

    // Search outward in rings and choose the nearest clear firing position.
    const searchRings = this.getAttackPositionSearchRings()

    for (let ring = 1; ring <= searchRings; ring++) {
      const radius = Constants.tileSize * ring

      for (let direction = 0; direction < 8; direction++) {
        const angle = direction * Math.PI / 4
        const x = sourceX + Math.cos(angle) * radius
        const y = sourceY + Math.sin(angle) * radius

        if (x < 0 || y < 0 ||
            x >= container.getColCount() * Constants.tileSize ||
            y >= container.getRowCount() * Constants.tileSize) {
          continue
        }

        const rejectedPositions = this.rejectedObstructedAttackPositions || []
        const wasRejected = rejectedPositions.some((position) => {
          return this.game.distance(x, y, position.x, position.y) < Constants.tileSize * 0.75
        })

        if (!wasRejected && this.hasClearShotFrom(x, y, target)) {
          this.obstructedAttackPosition = { x, y }
          return this.obstructedAttackPosition
        }
      }
    }

    return null
  }

  moveEntity(targetEntityToMove, deltaTime) {
    if (this.isIdle) {
      if (this.game.timestamp > this.stopIdlingTime) {
        this.isIdle = false
      }

      return
    }

    if (this.attackTarget) {
      const targetDistance = this.game.distanceBetween(this, this.attackTarget)
      const isBlocked = this.isObstacleBlockingTarget(this.attackTarget, targetDistance)

      if (isBlocked) {
        let firingPosition = this.getClearAttackPosition(this.attackTarget)
        const container = this.getContainer()
        const isMovable = container.isMovable()
        const currentX = isMovable ? this.getRelativeX() : this.getX()
        const currentY = isMovable ? this.getRelativeY() : this.getY()
        const stuckTimeout = this.getAttackPositionStuckTimeout()

        if (this.obstructedAttackPositionProgressTarget !== this.attackTarget) {
          this.obstructedAttackPositionProgressTarget = this.attackTarget
          this.obstructedAttackPositionProgressX = currentX
          this.obstructedAttackPositionProgressY = currentY
          this.obstructedAttackPositionProgressTime = this.game.timestamp
        } else if (
          this.game.distance(
            currentX,
            currentY,
            this.obstructedAttackPositionProgressX,
            this.obstructedAttackPositionProgressY
          ) >= Constants.tileSize * 0.25
        ) {
          this.obstructedAttackPositionProgressX = currentX
          this.obstructedAttackPositionProgressY = currentY
          this.obstructedAttackPositionProgressTime = this.game.timestamp
        } else if (
          firingPosition &&
          stuckTimeout &&
          this.game.timestamp - this.obstructedAttackPositionProgressTime >= stuckTimeout
        ) {
          if (!this.rejectedObstructedAttackPositions) {
            this.rejectedObstructedAttackPositions = []
          }

          this.rejectedObstructedAttackPositions.push(firingPosition)
          if (this.rejectedObstructedAttackPositions.length > 12) {
            this.rejectedObstructedAttackPositions.shift()
          }

          this.obstructedAttackPosition = null
          this.lastObstructedAttackPositionSearch = null
          this.obstructedAttackPositionProgressX = currentX
          this.obstructedAttackPositionProgressY = currentY
          this.obstructedAttackPositionProgressTime = this.game.timestamp
          firingPosition = this.getClearAttackPosition(this.attackTarget)
        }

        if (firingPosition) {
          const radian = Math.atan2(
            firingPosition.y - (this.getContainer().isMovable() ? this.getRelativeY() : this.getY()),
            firingPosition.x - (this.getContainer().isMovable() ? this.getRelativeX() : this.getX())
          )

          targetEntityToMove.steerTowardsAngle(radian)
          targetEntityToMove.applyForce(this.getForceFromAngle(radian))
          targetEntityToMove.applyForce(this.separate(this.getNeighbors()))
        } else {
          targetEntityToMove.stopMoving()
        }

        return
      }

      this.obstructedAttackPosition = null
      this.obstructedAttackPositionTarget = null
      this.obstructedAttackPositionProgressTarget = null

      const targetRadian = Math.atan2(
        this.attackTarget.getY() - targetEntityToMove.getY(),
        this.attackTarget.getX() - targetEntityToMove.getX()
      )

      targetEntityToMove.steerTowardsAngle(targetRadian)
      targetEntityToMove.stopMoving()
      return
    }

    let goal = this.getLatestGoal()
    if (!goal) {
      if (this.desiredAttackTarget) {
        this.debugMobBehavior("[addNonWanderingGoalTarget] desiredAttackTarget but no goal: " + this.desiredAttackTarget.constructor.name + ":" + this.desiredAttackTarget.getId())
        goal = this.addNonWanderingGoalTarget(this.desiredAttackTarget)
      }
    }

    if (this.isWandering) {
      let shouldContinue = this.wanderAround(targetEntityToMove)
      if (!shouldContinue) return
    }

    if (!goal) {
      this.isWandering = true
      this.enterBasicWanderingMode()
      return
    }


    if (this.hasReachedGoal(goal)) {
      this.onGoalReached(targetEntityToMove, goal)
      return
    }

    if (!this.isGoalTargetValid(goal.getTargetEntity())) {
      this.debugMobBehavior("[removeGoal] moveEntity !isGoalTargetValid: " + goal.getTargetEntity().constructor.name + ":" + goal.getTargetEntity().getId())
      goal.remove()
    }

    let radian = this.game.angle(this.getX(), this.getY(), goal.getTargetEntity().getX(), goal.getTargetEntity().getY())

    targetEntityToMove.steerTowardsAngle(radian)

    let arriveForce = this.getForceFromAngle(radian)
    let separateForce = this.separate(this.getNeighbors())

    targetEntityToMove.applyForce(arriveForce)
    targetEntityToMove.applyForce(separateForce)
  }

  findLineOfSightTarget() {
    const targets = this.getAttackables().map((tree) => {
      let targetsInRange = this.getLineOfSightTargets(tree)

      return targetsInRange.sort((target, otherTarget) => {
        return this.game.calculateDistance(this, target) - this.game.calculateDistance(this, otherTarget)
      })
    }).flat()

    return this.applyTargetSelectionStrategy(targets)
  }

  shouldIgnoreObstacle() {
    return true
  }

  examineLongRange() {
    // only for raids
    if (!this.getRaid()) return
    if (this.entityGroup && !this.entityGroup.isLeader(this)) return
    if (this.desiredAttackTarget) return

    if (this.lastLongRangeCheckTime) {
      let duration = this.game.timestamp - this.lastLongRangeCheckTime
      if (duration < Constants.physicsTimeStep * 3) {
        return
      }
    } 

    this.lastLongRangeCheckTime = this.game.timestamp

    let raid = this.getRaid()
    for (let id in raid.team.ownerships.structures) {
      let structure = raid.team.ownerships.structures[id]
      if (this.canAttack(structure)) {
        this.setDesiredAttackTarget(structure)
        break
      }
    }

  }
}

module.exports = HoverMob
