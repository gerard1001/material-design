(function () {
  function markAndInitDropdowns(root) {
    try {
      root = root || document;
      var toggleSelector =
        '[data-bs-toggle="dropdown"],[data-mdb-dropdown-init],[data-mdb-toggle="dropdown"]';
      var nodes = Array.prototype.slice.call(
        root.querySelectorAll ? root.querySelectorAll(toggleSelector) : []
      );
      if (!nodes.length) return;
      var DropdownClass =
        (window.mdb && window.mdb.Dropdown) ||
        (window.bootstrap && window.bootstrap.Dropdown) ||
        null;

      nodes.forEach(function (el) {
        try {
          if (
            DropdownClass &&
            typeof DropdownClass.getOrCreateInstance === "function"
          ) {
            DropdownClass.getOrCreateInstance(el);
          } else if (
            window.bootstrap &&
            window.bootstrap.Dropdown &&
            typeof window.bootstrap.Dropdown.getOrCreateInstance === "function"
          ) {
            window.bootstrap.Dropdown.getOrCreateInstance(el);
          } else if (
            window.jQuery &&
            window.jQuery.fn &&
            window.jQuery.fn.dropdown
          ) {
            window.jQuery(el).dropdown();
          }
          el.setAttribute("data-mdb-dropdown-initialized", "true");
          el.setAttribute("data-bs-dropdown-initialized", "true");
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Initial run
  markAndInitDropdowns(document);
  if (window.reinitDropdowns) window.reinitDropdowns(document);

  // Observe dynamic DOM changes
  try {
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.addedNodes && m.addedNodes.length) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n && n.nodeType === 1) {
              markAndInitDropdowns(n);
              if (window.reinitDropdowns) window.reinitDropdowns(n);
            }
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    console.error(e);
  }
})();
