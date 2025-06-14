Hooks.once("ready", () => {
  const MAX_LEVEL = 40;

  const originalPrepareBaseData = CONFIG.Actor.documentClass.prototype.prepareBaseData;

  CONFIG.Actor.documentClass.prototype.prepareBaseData = function () {
    originalPrepareBaseData.call(this);

    if (this.type !== "character") return;

    const classes = this.classes ?? {};
    const totalLevels = Object.values(classes).reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

    if (totalLevels > MAX_LEVEL) {
      ui.notifications.warn(`${this.name} has reached above level ${MAX_LEVEL}. This may require custom feature handling.`);
    }

    this.system.details.level = totalLevels;
  };

  console.log("🔓 Unlocked Levels (5e): Level cap raised to", MAX_LEVEL);
});
