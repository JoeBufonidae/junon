const BaseBadge = require('./base_badge')

class Youtube extends BaseBadge {
    getId() {
        return 'yt'
    }
    getName() {
        return 'Youtube'
    }

    async isQualified(player) {
        return false
    }

    getImageUrl() {
        return 'badges/yt.png'
    }

    getDescription() {
        return 'Given by a moderator to recognize YouTube creators.'
    }

    getColor() {
        //pure red
        return 'ff0000'
    }
}

module.exports = Youtube