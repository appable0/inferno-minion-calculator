class BazaarData {
  #apiUrl;
  #eventTarget;
  #data;

  constructor() {
    this.#apiUrl = "https://api.hypixel.net/skyblock/bazaar";
    this.#data = {};
    this.#eventTarget = new EventTarget();
    this.fetchData();

    setTimeout(() => {
      this.fetchData();
    }, 60 * 1000);
  }

  async fetchData() {
    try {
      const response = await fetch(this.#apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Bazaar data: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error("API response indicates failure.");
      }
      this.#data = data.products;
      this.#emitDataLoaded();
    } catch (error) {
      console.error(error.message);
    }
  }

  #getQuickStatusValue(productId, key) {
    const productData = this.#data[productId];
    const quickStatus = productData.quick_status;
    return quickStatus[key];
  }

  getInstasellPrice(productId) {
    return this.#getQuickStatusValue(productId, "sellPrice");
  }

  getBuyPrice(productId) {
    return this.#getQuickStatusValue(productId, "buyPrice");
  }

  onDataLoaded(callback) {
    this.#eventTarget.addEventListener("dataLoaded", callback);
  }

  #emitDataLoaded() {
    const event = new Event("dataLoaded");
    this.#eventTarget.dispatchEvent(event);
  }
}

export default new BazaarData();
