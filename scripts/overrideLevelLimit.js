// Debug log to confirm the module script is loading
console.log("🔓 Unlocked Levels module script loaded!");

// Set the maximum level during init
Hooks.once("init", () => {
  CONFIG.DND5E.maxLevel = 40;
  console.log("🔧 CONFIG.DND5E.maxLevel set to 40");
});

// Hook to override level calculation after actor base data is prepared
Hooks.once("ready", () => {
  const MAX_LEVEL = CONFIG.DND5E.maxLevel;

  const originalPrepareBaseData = CONFIG.Actor.documentClass.prototype.prepareBaseData;
  CONFIG.Actor.documentClass.prototype.prepareBaseData = function () {
    originalPrepareBaseData.call(this);
    if (this.type !== "character") return;

    const classes = this.classes ?? {};
    const totalLevels = Object.values(classes).reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

    this.system.details.level = totalLevels;

    if (totalLevels > 20) {
      console.log(`🔓 ${this.name} is above level 20 (now level ${totalLevels})`);
    }
  };

  // Patch the class item sheet input max attribute
  Hooks.on("renderItemSheet5eClass", (app, html) => {
    const input = html.find('input[name="system.levels"]');
    if (input.length) {
      input.attr("max", MAX_LEVEL);
      console.log(`🔧 Patched class level input max to ${MAX_LEVEL}`);
    }
  });

  // Patch item update logic to respect higher levels (libWrapper required)
  libWrapper.register("unlocked-levels", "CONFIG.Item.documentClass.prototype._update", async function (wrapped, formData, ...args) {
    const levelPath = "system.levels";
    if (formData[levelPath]) {
      let level = parseInt(formData[levelPath]);
      if (level > MAX_LEVEL) {
        ui.notifications.warn(`Class level capped at ${MAX_LEVEL}`);
        formData[levelPath] = MAX_LEVEL;
      }
    }
    return wrapped(formData, ...args);
  }, "WRAPPER");

  console.log(`🔓 Unlocked Levels (5e) active. Cap raised to level ${MAX_LEVEL}`);
});
