Hooks.once("ready", () => {
  const MAX_LEVEL = 40;

  // Allow characters to go above level 20
  const originalPrepareBaseData = CONFIG.Actor.documentClass.prototype.prepareBaseData;
  CONFIG.Actor.documentClass.prototype.prepareBaseData = function () {
    originalPrepareBaseData.call(this);

    if (this.type !== "character") return;

    const classes = this.classes ?? {};
    const totalLevels = Object.values(classes).reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

    // Set the total level
    this.system.details.level = Math.min(totalLevels, MAX_LEVEL);

    if (totalLevels > 20) {
      console.log(`🔓 Unlocked Levels: ${this.name} has ${totalLevels} levels`);
    }
  };

  // Patch class sheet to accept levels > 20
  libWrapper.register("unlocked-levels", "CONFIG.Item.sheetClasses.class['dnd5e.ItemSheet5eClass'].cls.prototype._updateObject", async function (wrapped, ...args) {
    const [event, formData] = args;

    // Let levels up to MAX_LEVEL be valid
    const levelPath = "system.levels";
    if (formData[levelPath]) {
      let level = parseInt(formData[levelPath]);
      if (level > MAX_LEVEL) {
        ui.notifications.warn(`Class levels cannot exceed ${MAX_LEVEL}. Setting to ${MAX_LEVEL}.`);
        formData[levelPath] = MAX_LEVEL;
      }
    }

    return wrapped(...args);
  }, "WRAPPER");

  console.log("🔓 Unlocked Levels (5e): Level cap raised to", MAX_LEVEL);
});
