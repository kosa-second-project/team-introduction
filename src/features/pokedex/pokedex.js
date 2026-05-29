// Pokedex overlay, detail view, and ending screen behavior.
Object.assign(window.App.prototype, {
  isPokedexOpen() {
    const overlay = document.getElementById("pokedex-overlay");
    return !!overlay && !overlay.classList.contains("hidden");
  },

  hasCompletedDex() {
    return window.DEVELOPERS.every(dev => this.capturedDevs.includes(dev.id));
  },

  showEndingScreen() {
    this.renderEndingShowcase();
    this.switchGameState(this.STATE_ENDING);
    window.audioManager.playCatchSuccess();
  },

  playEndingVideo() {
    const video = document.getElementById("ending-video");
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {
          this.showTemporaryToast("엔딩 영상의 재생 버튼을 눌러 확인해 주세요.");
        });
      });
    }
  },

  stopEndingVideo() {
    const video = document.getElementById("ending-video");
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  },

  renderEndingShowcase() {
    const showcase = document.getElementById("ending-dev-showcase");
    if (!showcase) return;

    showcase.innerHTML = "";
    window.DEVELOPERS.forEach((dev, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "ending-dev-card";
      card.addEventListener("click", () => {
        this.openPokedexOverlay();
        this.selectPokedexDeveloper(dev.id);
      });

      const img = document.createElement("img");
      img.src = dev.image;
      img.alt = dev.name;

      const no = document.createElement("span");
      no.className = "ending-dev-no";
      no.textContent = `No.${String(idx + 1).padStart(3, "0")}`;

      const name = document.createElement("strong");
      name.textContent = dev.name;

      const type = document.createElement("span");
      type.className = "ending-dev-type";
      type.textContent = dev.type;

      card.appendChild(img);
      card.appendChild(no);
      card.appendChild(name);
      card.appendChild(type);
      showcase.appendChild(card);
    });
  },

  openPokedexOverlay() {
    this.stateBeforeOverlay = this.currentGameState;
    if (this.engine) this.engine.stop();
    document.getElementById("pokedex-overlay").classList.remove("hidden");
    window.audioManager.playTone(700, "square", 0.1, 0.06);
    this.renderPokedexList();
    this.closeAllActiveVideos();
  },

  closePokedexOverlay() {
    document.getElementById("pokedex-overlay").classList.add("hidden");
    this.closeAllActiveVideos();
    const returnState = this.stateBeforeOverlay || this.STATE_WORLD;
    this.stateBeforeOverlay = null;
    this.switchGameState(returnState);
  },

  closeAllActiveVideos() {
    const video = document.getElementById("project-video");
    if (video) video.pause();
  },

  renderPokedexList() {
    const listUl = document.getElementById("dex-list-ul");
    listUl.innerHTML = "";
    let capCount = 0;

    window.DEVELOPERS.forEach((dev, idx) => {
      const li = document.createElement("li");
      const isCap = this.capturedDevs.includes(dev.id);
      
      li.className = isCap ? "dex-li-item" : "dex-li-item locked";
      li.setAttribute("data-id", dev.id);
      
      const noStr = String(idx + 1).padStart(3, "0");
      if (isCap) {
        li.textContent = `No.${noStr} ${dev.name}`;
        if (this.currentSelectedDevId === dev.id) {
          li.classList.add("active");
        }
        capCount++;
      } else {
        li.textContent = `No.${noStr} ??? (잠김)`;
      }
      
      listUl.appendChild(li);
    });

    document.getElementById("captured-count").textContent = capCount;
  },

  selectPokedexDeveloper(devId) {
    this.currentSelectedDevId = devId;
    this.renderPokedexList();

    const detailArea = document.getElementById("dex-detail-area");
    detailArea.className = "dex-content";

    document.getElementById("dex-detail-placeholder-msg").classList.add("hidden");
    document.getElementById("dex-detail-content-view").classList.remove("hidden");

    this.updatePokedexDetail(devId);
  },

  updatePokedexDetail(devId) {
    const dev = window.DEVELOPERS.find(d => d.id === devId);
    if (!dev) return;

    const noMap = { dev_frontend: "No.001", dev_backend: "No.002", dev_fullstack: "No.003", dev_data: "No.004" };
    document.getElementById("detail-no-text").textContent = noMap[devId];
    document.getElementById("detail-name-text").textContent = dev.name;
    document.getElementById("detail-type-badge").textContent = dev.type;
    document.getElementById("detail-bio-text").textContent = dev.description;

    this.renderSpriteElement(document.getElementById("character-base-emoji"), dev.image, dev.name);
    this.renderPersonalProfile(dev);
    this.renderTeamIntro(dev.id);

    const layerBox = document.getElementById("equipped-visuals-container");
    layerBox.innerHTML = "";

    if (dev.equipped && dev.equipped.length > 0) {
      dev.equipped.forEach(itemId => {
        const item = window.ITEMS.find(i => i.id === itemId);
        if (item) {
          const el = document.createElement("div");
          el.className = `equipped-layer ${itemId}${item.isCustom ? " custom-equipped" : ""}`;
          if (item.imageData) {
            const img = document.createElement("img");
            img.src = item.imageData;
            img.alt = item.name;
            el.appendChild(img);
          } else {
            el.textContent = item.icon;
          }
          layerBox.appendChild(el);
        }
      });
      const names = dev.equipped
        .map(id => window.ITEMS.find(i => i.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      document.getElementById("equipped-items-list-text").textContent = `장착 장비: [ ${names} ]`;
    } else {
      document.getElementById("equipped-items-list-text").textContent = "장착 장비: 없음";
    }

    this.renderItemInventory();

    const setStat = (barId, valId, val) => {
      document.getElementById(barId).style.width = `${Math.min(100, Math.max(0, val))}%`;
      document.getElementById(valId).textContent = val;
    };
    const computedStats = this.developerState.getComputedStats(devId);
    setStat("stat-bar-coding", "stat-val-coding", computedStats.coding);
    setStat("stat-bar-debugging", "stat-val-debugging", computedStats.debugging);
    setStat("stat-bar-design", "stat-val-design", computedStats.design);
    setStat("stat-bar-speed", "stat-val-speed", computedStats.speed);

    const projContainer = document.getElementById("detail-projects-container");
    projContainer.innerHTML = "";

    dev.projects.forEach(p => {
      const card = document.createElement("div");
      card.className = "project-card";
      
      const title = document.createElement("div");
      title.className = "project-title";
      title.textContent = p.title;

      const tech = document.createElement("span");
      tech.className = "project-tech";
      tech.textContent = p.tech;

      const desc = document.createElement("div");
      desc.className = "project-desc";
      desc.textContent = p.desc;

      card.appendChild(title);
      card.appendChild(tech);
      card.appendChild(desc);
      projContainer.appendChild(card);
    });

    const videoArea = document.getElementById("project-video-area");
    const videoEl = document.getElementById("project-video");

    this.updatePokedexVideo(dev, videoArea, videoEl);
  },

  updatePokedexVideo(dev, videoArea = document.getElementById("project-video-area"), videoEl = document.getElementById("project-video")) {
    if (!videoArea || !videoEl || !dev) return;

    const title = videoArea.querySelector(".box-title");
    if (title) title.textContent = "포획 순간 녹화 영상";

    const captureUrl = this.captureVideoUrls[dev.id];
    if (captureUrl) {
      videoArea.classList.remove("hidden");
      if (videoEl.src !== captureUrl) {
        videoEl.src = captureUrl;
        videoEl.load();
      }
      return;
    }

    videoArea.classList.add("hidden");
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();

    this.loadCaptureVideoForDev(dev.id).then(url => {
      if (url && this.currentSelectedDevId === dev.id) {
        this.updatePokedexVideo(dev, videoArea, videoEl);
      }
    });
  },

  renderTeamIntro(activeDevId) {
    const team = window.TEAM_PROFILE;
    if (!team) return;

    const titleEl = document.getElementById("team-title-text");
    const subtitleEl = document.getElementById("team-subtitle-text");
    const mottoEl = document.getElementById("team-motto-text");
    const memberList = document.getElementById("team-member-list");

    if (!titleEl || !subtitleEl || !mottoEl || !memberList) {
      return;
    }

    titleEl.textContent = team.title;
    subtitleEl.textContent = team.subtitle;
    mottoEl.textContent = team.motto;

    memberList.innerHTML = "";
    team.members.forEach(member => {
      const card = document.createElement("div");
      card.className = `team-member-card${member.id === activeDevId ? " active" : ""}`;

      const no = document.createElement("span");
      no.className = "team-member-no";
      no.textContent = String(team.members.indexOf(member) + 1).padStart(2, "0");

      const name = document.createElement("strong");
      name.textContent = member.name;

      const role = document.createElement("span");
      role.className = "team-member-role";
      role.textContent = member.role;

      const trait = document.createElement("p");
      trait.textContent = member.trait;

      card.appendChild(no);
      card.appendChild(name);
      card.appendChild(role);
      card.appendChild(trait);
      memberList.appendChild(card);
    });
  },

  renderPersonalProfile(dev) {
    const profile = window.DEVELOPER_PROFILES?.[dev.id];
    if (!profile) return;

    const personalAvatar = document.getElementById("personal-avatar");
    const personalTitle = document.getElementById("personal-title-text");
    const personalHeadline = document.getElementById("personal-headline-text");
    const personalLocation = document.getElementById("personal-location-text");
    const personalContact = document.getElementById("personal-contact-text");
    const stackList = document.getElementById("personal-stack-list");
    const linkList = document.getElementById("personal-link-list");

    if (!personalAvatar || !personalTitle || !personalHeadline || !personalLocation || !personalContact || !stackList || !linkList) {
      return;
    }

    this.renderSpriteElement(personalAvatar, dev.profileImage || dev.image, dev.name);
    personalTitle.textContent = profile.title;
    personalHeadline.textContent = profile.headline;
    personalLocation.textContent = profile.location;
    personalContact.textContent = profile.contact;

    stackList.innerHTML = "";
    profile.stack.forEach(label => {
      const chip = document.createElement("span");
      chip.className = "personal-chip";
      chip.textContent = label;
      stackList.appendChild(chip);
    });

    linkList.innerHTML = "";
    profile.links.forEach(link => {
      if (!link.url) {
        const badge = document.createElement("span");
        badge.className = "personal-link personal-link-static";
        badge.textContent = link.label;
        linkList.appendChild(badge);
        return;
      }

      const anchor = document.createElement("a");
      anchor.className = "personal-link";
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = link.label;
      linkList.appendChild(anchor);
    });
  }
});
