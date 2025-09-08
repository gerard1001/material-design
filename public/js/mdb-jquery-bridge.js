(function () {
  const $ = window.jQuery;
  if (!$) return;

  const { Tooltip, Popover } = mdb || bootstrap || {};

  const defineJQueryBridge = (pluginClass) => {
    if (!pluginClass || !pluginClass.NAME) return;

    const name = pluginClass.NAME.toLowerCase();
    if (!$.fn[name]) {
      const JQUERY_NO_CONFLICT = $.fn[name];

      $.fn[name] = function (config) {
        return this.each(function () {
          let data = pluginClass.getInstance(this);
          if (!data) {
            data = new pluginClass(
              this,
              typeof config === "object" ? config : {}
            );
          }
          if (typeof config === "string") {
            if (typeof data[config] === "function") {
              data[config]();
            }
          }
        });
      };

      $.fn[name].Constructor = pluginClass;
      $.fn[name].noConflict = () => {
        $.fn[name] = JQUERY_NO_CONFLICT;
        return $.fn[name];
      };
    }
  };

  defineJQueryBridge(Tooltip);
  defineJQueryBridge(Popover);
})();
