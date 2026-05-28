const PokedexUi = {
  statLabels: {
    coding: "코딩",
    debugging: "디버깅",
    design: "디자인",
    speed: "스피드",
    hp: "HP",
  },

  formatStatsBoost(statsBoost = {}) {
    return Object.entries(statsBoost)
      .map(([stat, value]) => `${this.statLabels[stat] || stat}+${value}`)
      .join(" ");
  },

  renderItemInventory({ container, items, equippedItemIds = [] }) {
    if (!container) return;

    container.innerHTML = "";
    items.forEach((item) => {
      const node = document.createElement("div");
      node.className = "drag-item-node";
      node.draggable = true;
      node.setAttribute("data-item-id", item.id);

      if (equippedItemIds.includes(item.id)) {
        node.classList.add("equipped");
      }

      const icon = document.createElement("span");
      icon.className = "drag-node-ico";
      if (item.imageData) {
        const img = document.createElement("img");
        img.src = item.imageData;
        img.alt = item.name;
        icon.appendChild(img);
      } else {
        icon.textContent = item.icon || "◇";
      }

      const details = document.createElement("div");
      details.className = "drag-node-details";

      const name = document.createElement("div");
      name.className = "node-name";
      name.textContent = item.name;

      const boost = document.createElement("div");
      boost.className = "node-boost";
      boost.textContent = `${this.formatStatsBoost(item.statsBoost)}${equippedItemIds.includes(item.id) ? " · 착용중" : ""}`;

      details.appendChild(name);
      details.appendChild(boost);
      node.appendChild(icon);
      node.appendChild(details);
      container.appendChild(node);
    });
  },
};

window.PokedexUi = PokedexUi;
