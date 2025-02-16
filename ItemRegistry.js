export const items = {
    "BLAZE_ROD_DISTILLATE": {
        name: "Blaze Rod Distillate",
        rarity: "rare"
    },
    "MAGMA_CREAM_DISTILLATE": {
        name: "Magma Cream Distillate",
        rarity: "rare"
    },
    "NETHER_STALK_DISTILLATE": {
        name: "Nether Wart Distillate",
        rarity: "rare"
    },
    "GLOWSTONE_DUST_DISTILLATE": {
        name: "Glowstone Dust Distillate",
        rarity: "rare"
    },
    "CRUDE_GABAGOOL_DISTILLATE": {
        name: "Crude Gabagool Distillate",
        rarity: "rare"
    },
    "FUEL_GABAGOOL": {
        name: "Fuel Gabagool",
        rarity: "rare"
    },
    "HEAVY_GABAGOOL": {
        name: "Heavy Gabagool",
        rarity: "epic"
    },
    "HYPERGOLIC_GABAGOOL": {
        name: "Hypergolic Gabagool",
        rarity: "legendary"
    },
    "CAPSAICIN_EYEDROPS_NO_CHARGES": {
        name: "Capsaicin Eyedrop",
        rarity: "rare"
    },
    "SCORCHED_POWER_CRYSTAL": {
        name: "Scorched Power Crystal",
        rarity: "legendary"
    },
    "SULPHURIC_COAL": {
        name: "Sulphuric Coal",
        rarity: "rare"
    },
    "CRUDE_GABAGOOL": {
        name: "Crude Gabagool",
        rarity: "uncommon"
    },
    "VERY_CRUDE_GABAGOOL": {
        name: "Very Crude Gabagool",
        rarity: "rare"
    },
    "CHILI_PEPPER": {
        name: "Chili Pepper",
        rarity: "uncommon"
    },
    "INFERNO_VERTEX": {
        name: "Inferno Vertex",
        rarity: "epic"
    },
    "INFERNO_APEX": {
        name: "Inferno Apex",
        rarity: "legendary"
    },
    "REAPER_PEPPER": {
        name: "Reaper Pepper",
        rarity: "legendary"
    },
    "INFERNO_FUEL_BLOCK": {
        name: "Inferno Fuel Block",
        rarity: "rare"
    },
    "ENCHANTED_SULPHUR": {
        name: "Enchanted Sulphur",
        rarity: "rare"
    },
    "ENCHANTED_COAL": {
        name: "Enchanted Coal",
        rarity: "uncommon"
    },
}

class Item {
    constructor(skyblockId, name, rarity, imagePath) {
        this.skyblockId = skyblockId
        this.name = name
        this.rarity = rarity
        this.imagePath = imagePath
    }

    icon() {
        const image = document.createElement("img")
        image.src = this.imagePath
        return image
    }

    label() {
        const span = document.createElement("span")
        span.classList.add(this.rarity)
        const name = document.createTextNode(this.name)
        span.appendChild(name)
        return span
    }

    labeledIcon() {
        const span = document.createElement("span")
        span.classList.add("texture")
        span.appendChild(this.icon())
        span.appendChild(this.label())
        return span
    }

}

class ItemRegistry {
    constructor(items) {
        this.items = items;
    }

    get(id) {
        const data = this.items[id]
        if (!data) return undefined
        return new Item(id, data.name, data.rarity, `assets/${id}.gif`)
    }
}

export default new ItemRegistry(items)