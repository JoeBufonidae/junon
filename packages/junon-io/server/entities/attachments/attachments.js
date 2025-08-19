
const Attachments = {
  jet_boost: {
    id: "jet_boost",
    name: "Jet Boost",
    modifiers: {
      speed: 5,
    },
    tier: 2, // you can track tiers for later logic
  },

  oxygen_tank: {
    id: "oxygen_tank",
    name: "Oxygen Tank",
    modifiers: {
      oxygen: 50,
    },
    tier: 1,
  },

  reinforced_plating: {
    id: "reinforced_plating",
    name: "Reinforced Plating",
    modifiers: {
      defense: 10,
    },
    tier: 3,
  },


};

module.exports = Attachments;