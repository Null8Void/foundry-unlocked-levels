Hooks.once("ready", () => {
  const MAX_LEVEL = 40;

  // Patch prepareBaseData to allow >20 levels
  const originalPrepareBaseData = CONFIG.Actor.documentClass.prototype.prepareBaseData;
  CONFIG.Actor.documentClass.prototype.prepareBaseData = function () {
    originalPrepareBaseData.call(this);

    if (this.type !== "character") return;

    const classes = this.classes ?? {};
    const totalLevels = Object.values(classes).reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

    this.system.details.level = Math.min(totalLevels, MAX_LEVEL);

    if (totalLevels > 20) {
      console.log(`🔓 Unlocked Levels: ${this.name} is level ${totalLevels}`);
    }
  };

  // Patch the class sheet HTML to allow higher level input
  Hooks.on("renderItemSheet5eClass", (app, html, data) => {
    const levelInput = html.find('input[name="system.levels"]');
    if (levelInput.length) {
      levelInput.attr("max", MAX_LEVEL);
    }
  });

  // Patch the class sheet update method to allow values above 20
  libWrapper.register("unlocked-levels", "CONFIG.Item.sheetClasses.class['dnd5e.ItemSheet5eClass'].cls.prototype._updateObject", async function (wrapped, ...args) {
    const [event, formData] = args;
    const levelPath = "system.levels";

    if (formData[levelPath]) {
      let level = parseInt(formData[levelPath]);
      if (level > MAX_LEVEL) {
        ui.notifications.warn(`Class levels capped at ${MAX_LEVEL}`);
        formData[levelPath] = MAX_LEVEL;
      }
    }

    return wrapped(...args);
  }, "WRAPPER");

  console.log(`🔓 Unlocked Levels (5e): Enabled up to level ${MAX_LEVEL}`);
});
