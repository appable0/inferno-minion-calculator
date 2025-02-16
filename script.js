import bazaar from "./BazaarData.js";
import itemRegistry from "./ItemRegistry.js";

bazaar.onDataLoaded(() => {});

const minionTierElement = document.getElementById("minionTier");
const numMinionsElement = document.getElementById("numMinions");
const fuelTypeElement = document.getElementById("fuelType");
const slot1Element = document.getElementById("slot1");
const slot2Element = document.getElementById("slot2");
const beaconElement = document.getElementById("beacon");
const scorchedCrystalElement = document.getElementById("scorchedCrystal");
const postcardElement = document.getElementById("postcard");
const mithrilInfusionElement = document.getElementById("mithrilInfusion");
const freeWillElement = document.getElementById("freeWill");
const eyedropElement = document.getElementById("eyedrop");
const bazaarMethodElement = document.getElementById("bazaarMethod");
const craftSulphuricCoalElement = document.getElementById("craftSulphuricCoal");
const displayTypeElement = document.getElementById("displayType");

const inputElements = [
  minionTierElement,
  numMinionsElement,
  fuelTypeElement,
  slot1Element,
  slot2Element,
  beaconElement,
  scorchedCrystalElement,
  postcardElement,
  mithrilInfusionElement,
  freeWillElement,
  eyedropElement,
  bazaarMethodElement,
  craftSulphuricCoalElement,
  displayTypeElement,
];

inputElements.forEach((element) => {
  element.addEventListener("input", () => {
    console.log("Updating display due to input change.");
    updateMainDisplay();
  });
});

function getMinionConfig() {
  const minionTier = minionTierElement.value;
  const numMinions = parseInt(numMinionsElement.value, 10);
  const fuelType = fuelTypeElement.value;

  const slot1 = slot1Element.value;
  const slot2 = slot2Element.value;

  const beaconLevel = parseInt(beaconElement.value, 10);

  const scorchedCrystal = scorchedCrystalElement.checked;
  const postcard = postcardElement.checked;
  const mithrilInfusion = mithrilInfusionElement.checked;
  const freeWill = freeWillElement.checked;
  const eyedrop = eyedropElement.checked;
  const bazaarMethod = bazaarMethodElement.value;
  const craftSulphuricCoal = craftSulphuricCoalElement.checked;
  const displayType = displayTypeElement.value;

  return {
    minionTier,
    numMinions,
    fuelType,
    eyedrop,
    bazaarMethod,
    craftSulphuricCoal,
    displayType,
    upgrades: {
      slot1,
      slot2,
      beaconLevel,
      scorchedCrystal,
      postcard,
      mithrilInfusion,
      freeWill,
    },
  };
}

function calculateSpeedBonus(config) {
  const risingCelsiusBonus = 0.18 * Math.min(config.numMinions, 10);
  const beaconBonus = config.upgrades.beaconLevel * 0.02;
  const scorchedCrystalBonus = config.upgrades.scorchedCrystal ? 0.01 : 0;
  const postcardBonus = config.upgrades.postcard ? 0.05 : 0;
  const mithrilInfusionBonus = config.upgrades.mithrilInfusion ? 0.1 : 0;
  const freeWillBonus = config.upgrades.freeWill ? 0.1 : 0;
  const slot1Bonus = getSlotBonus(config.upgrades.slot1);
  const slot2Bonus = getSlotBonus(config.upgrades.slot2);

  let speedBonus =
    slot1Bonus +
    slot2Bonus +
    risingCelsiusBonus +
    beaconBonus +
    scorchedCrystalBonus +
    postcardBonus +
    mithrilInfusionBonus +
    freeWillBonus;

  return speedBonus;
}

function getSlotBonus(slot) {
  const slotBonuses = {
    none: 0,
    flycatcher: 0.2,
    expander: 0.05,
  };
  return slotBonuses[slot];
}

function calculateFuelMultiplier(config) {
  const fuelMultipliers = {
    rare: 10,
    epic: 15,
    legendary: 20,
  };
  return fuelMultipliers[config.fuelType];
}

function calculateBaseCooldown(config) {
  const infernoMinionCooldowns = [
    1013, 982, 950, 919, 886, 855, 823, 792, 760, 728, 697,
  ];
  return infernoMinionCooldowns[config.minionTier - 1];
}

function calculateDropTable(config) {
  const gabagool = { item: "VERY_CRUDE_GABAGOOL", rate: 0.00520833333 };

  if (config.fuelType === "legendary") {
    const multiplier = 1 + (config.eyedrop ? 0.3 : 0);
    const apexPerk = config.minionTier >= 10 ? 2 : 1;
    return [
      gabagool,
      { item: "CHILI_PEPPER", rate: 0.007353 * multiplier },
      { item: "INFERNO_VERTEX", rate: 0.0001681 * multiplier },
      { item: "REAPER_PEPPER", rate: 0.000002183 * multiplier },
      { item: "INFERNO_APEX", rate: 0.0000007639 * multiplier * apexPerk },
    ];
  } else {
    return [gabagool];
  }
}

function getSellPrice(config, item) {
  if (config.bazaarMethod == "insta") {
    return bazaar.getInstasellPrice(item) * (1 - 0.0125);
  } else {
    return bazaar.getBuyPrice(item) * (1 - 0.0125);
  }
}

function getBuyPrice(config, item) {
  if (config.bazaarMethod == "insta") {
    return bazaar.getBuyPrice(item);
  } else {
    return bazaar.getInstasellPrice(item);
  }
}

function calculateSetup(config) {
  const baseCooldown = calculateBaseCooldown(config);
  const speedBonus = calculateSpeedBonus(config);
  const fuelBonus = calculateFuelMultiplier(config);

  const minionMultiplier = config.displayType == "all" ? config.numMinions : 1;

  const cooldown = baseCooldown / ((1 + speedBonus) * (1 + fuelBonus));
  let harvestsPerDay = (86400 / (2 * cooldown)) * minionMultiplier;

  const drops = calculateDropTable(config);

  const revenue = [];
  const expenses = [];
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const drop of drops) {
    const lineItem = {};
    const sellPrice = getSellPrice(config, drop.item);
    lineItem.item = drop.item;
    lineItem.amount = drop.rate * harvestsPerDay;
    lineItem.coinsPerUnit = sellPrice;
    lineItem.coinsPerDay = lineItem.amount * sellPrice;
    revenue.push(lineItem);
    totalRevenue += lineItem.coinsPerDay;
  }

  const fuelMaterials = calculateFuelMaterials(config);

  for (const material of fuelMaterials) {
    const lineItem = {};
    const buyPrice = getBuyPrice(config, material.item);
    lineItem.item = material.item;
    lineItem.amount = material.amount * minionMultiplier;
    lineItem.coinsPerUnit = buyPrice;
    lineItem.coinsPerDay = lineItem.amount * buyPrice;
    expenses.push(lineItem);
    totalExpenses += lineItem.coinsPerDay;
  }

  const totalProfit = totalRevenue - totalExpenses;

  return {
    baseCooldown,
    cooldown,
    displayType: config.displayType,
    totalProfit,
    totalExpenses,
    totalRevenue,
    revenue,
    expenses,
  };
}

function updateMainDisplay() {
  const config = getMinionConfig();
  const data = calculateSetup(config);
  updateTable(data);
}

function formatNumber(number) {
  if (number < 1) {
    return number.toLocaleString(undefined, { maximumSignificantDigits: 2 });
  } else {
    return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
}

function formatCoins(number) {
  return number.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

function updateTable(data) {
  const header =
    data.displayType == "per" ? "Profit per Minion" : "Total Profit";
  document.getElementById("profitTableHeader").textContent = header;

  document.getElementById(
    "timeBetweenActions"
  ).textContent = `${data.cooldown.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}s`;

  const revenueContainer = document.getElementById("revenue");
  const expensesContainer = document.getElementById("expenses");
  revenueContainer.innerHTML = "";
  expensesContainer.innerHTML = "";
  function createRow(item, amount, coinsPerUnit, total) {
    const row = document.createElement("tr");
    const resolvedItem = itemRegistry.get(item);
    const iconCell = document.createElement("td");
    iconCell.appendChild(resolvedItem.labeledIcon());

    const amountCell = document.createElement("td");
    amountCell.classList.add("table-num");
    amountCell.textContent = formatNumber(amount);

    const coinsPerUnitCell = document.createElement("td");
    coinsPerUnitCell.classList.add("coin", "table-coin");
    coinsPerUnitCell.textContent = formatCoins(coinsPerUnit);

    const totalCell = document.createElement("td");
    totalCell.classList.add("coin", "table-coin");
    totalCell.textContent = formatCoins(total);
    row.append(iconCell, amountCell, coinsPerUnitCell, totalCell);
    return row;
  }

  for (const entry of data.revenue) {
    revenueContainer.appendChild(
      createRow(entry.item, entry.amount, entry.coinsPerUnit, entry.coinsPerDay)
    );
  }

  for (const entry of data.expenses) {
    expensesContainer.appendChild(
      createRow(entry.item, entry.amount, entry.coinsPerUnit, entry.coinsPerDay)
    );
  }

  document.getElementById("totalRevenue").textContent = formatCoins(
    data.totalRevenue
  );
  document.getElementById("totalExpenses").textContent =
    "\u{2212}" + formatCoins(data.totalExpenses);
  document.getElementById("totalProfit").textContent = formatCoins(
    data.totalProfit
  );
}

bazaar.onDataLoaded(() => {
  console.log("Updating display due to Bazaar refresh.");
  updateMainDisplay();
});

const fuelMaterialsRare = [
  { item: "INFERNO_FUEL_BLOCK", amount: 2 },
  { item: "CRUDE_GABAGOOL_DISTILLATE", amount: 6 },
  { item: "CRUDE_GABAGOOL", amount: 24 },
  { item: "SULPHURIC_COAL", amount: 1 },
];

const fuelMaterialsEpic = [
  { item: "INFERNO_FUEL_BLOCK", amount: 2 },
  { item: "CRUDE_GABAGOOL_DISTILLATE", amount: 6 },
  { item: "VERY_CRUDE_GABAGOOL", amount: 3 },
  { item: "SULPHURIC_COAL", amount: 25 },
];

const fuelMaterialsLegendary = [
  { item: "INFERNO_FUEL_BLOCK", amount: 2 },
  { item: "CRUDE_GABAGOOL_DISTILLATE", amount: 6 },
  { item: "VERY_CRUDE_GABAGOOL", amount: 36 },
  { item: "SULPHURIC_COAL", amount: 301 },
];

const sulphuricCoalMaterials = [
  { item: "ENCHANTED_SULPHUR", amount: 0.25 },
  { item: "ENCHANTED_COAL", amount: 4 },
];

function calculateFuelMaterials(config) {
  let fuelMaterials =
    config.fuelType === "rare"
      ? fuelMaterialsRare
      : config.fuelType === "epic"
      ? fuelMaterialsEpic
      : fuelMaterialsLegendary;

  let materials = [];
  materials.push(...fuelMaterials);

  if (config.craftSulphuricCoal) {
    const sulphuricCount = materials.find(
      (item) => item.item == "SULPHURIC_COAL"
    ).amount;
    materials = materials.filter((item) => item.item != "SULPHURIC_COAL");

    sulphuricCoalMaterials.forEach((material) => {
      materials.push({
        item: material.item,
        amount: sulphuricCount * material.amount,
      });
    });
  }

  if (config.eyedrop) {
    materials.push({ item: "CAPSAICIN_EYEDROPS_NO_CHARGES", amount: 0.5 });
  }

  return materials;
}
