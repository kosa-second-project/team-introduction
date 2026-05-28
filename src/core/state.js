class DeveloperStateManager {
  constructor(developers, items) {
    this.developers = developers;
    this.items = items;
    this.baseStatsById = Object.fromEntries(
      developers.map((developer) => [developer.id, { ...developer.stats }]),
    );

    this.developers.forEach((developer) => {
      if (!Array.isArray(developer.equipped)) developer.equipped = [];
      developer.stats = { ...this.baseStatsById[developer.id] };
    });
  }

  getDeveloper(devId) {
    return this.developers.find((developer) => developer.id === devId);
  }

  getItem(itemId) {
    return this.items.find((item) => item.id === itemId);
  }

  getEquippedItemIds(devId) {
    return [...(this.getDeveloper(devId)?.equipped || [])];
  }

  setEquippedItemIds(devId, itemIds) {
    const developer = this.getDeveloper(devId);
    if (!developer) return;

    const validIds = new Set(this.items.map((item) => item.id));
    developer.equipped = [...new Set(itemIds)].filter((itemId) => validIds.has(itemId));
  }

  toggleItem(devId, itemId) {
    const developer = this.getDeveloper(devId);
    const item = this.getItem(itemId);
    if (!developer || !item) return null;

    const isEquipped = developer.equipped.includes(itemId);
    this.setEquippedItemIds(
      devId,
      isEquipped
        ? developer.equipped.filter((id) => id !== itemId)
        : [...developer.equipped, itemId],
    );

    return { developer, item, isEquipped: !isEquipped };
  }

  getComputedStats(devId) {
    const developer = this.getDeveloper(devId);
    const baseStats = { ...(this.baseStatsById[devId] || developer?.stats || {}) };
    if (!developer) return baseStats;

    developer.equipped.forEach((itemId) => {
      const item = this.getItem(itemId);
      Object.entries(item?.statsBoost || {}).forEach(([stat, boost]) => {
        if (baseStats[stat] === undefined) return;
        baseStats[stat] = Math.max(0, baseStats[stat] + boost);
      });
    });

    return baseStats;
  }

  applySavedState(savedState = {}) {
    (savedState.developersState || []).forEach((developerState) => {
      this.setEquippedItemIds(developerState.id, developerState.equipped || []);
    });

    return {
      capturedDevs: Array.isArray(savedState.capturedDevs) ? savedState.capturedDevs : [],
      customItems: Array.isArray(savedState.customItems) ? savedState.customItems : [],
    };
  }

  buildSave(capturedDevs, customItems) {
    return {
      version: 2,
      capturedDevs: Array.isArray(capturedDevs) ? capturedDevs : [],
      customItems: Array.isArray(customItems) ? customItems : [],
      developersState: this.developers.map((developer) => ({
        id: developer.id,
        equipped: this.getEquippedItemIds(developer.id),
      })),
    };
  }

  registerCustomItems(items) {
    if (!Array.isArray(items)) return [];

    const normalizedItems = items
      .filter((item) => item && item.id && item.imageData && item.statsBoost)
      .filter((item) => item.id.startsWith("custom_"))
      .map((item) => ({
        id: item.id,
        name: item.name || "직접 그린 아이템",
        description: item.description || "직접 그려 만든 커스텀 장비입니다.",
        imageData: item.imageData,
        statsBoost: item.statsBoost,
        isCustom: true,
      }));

    normalizedItems.forEach((item) => {
      const itemIndex = this.items.findIndex((saved) => saved.id === item.id);
      if (itemIndex >= 0) {
        this.items[itemIndex] = item;
      } else {
        this.items.push(item);
      }
    });

    this.developers.forEach((developer) => {
      this.setEquippedItemIds(developer.id, developer.equipped || []);
    });

    return normalizedItems;
  }
}

window.DeveloperStateManager = DeveloperStateManager;
