(function () {
  function markAndInitCollapses(root) {
    try {
      root = root || document;
      // Find Bootstrap-standard collapse triggers not yet picked up by MDB autoinit
      var nodes = Array.prototype.slice.call(
        root.querySelectorAll
          ? root.querySelectorAll(
              '[data-bs-toggle="collapse"]:not([data-bs-collapse-init])'
            )
          : []
      );
      if (!nodes.length) return;

      var CollapseClass =
        (window.mdb && window.mdb.Collapse) ||
        (window.bootstrap && window.bootstrap.Collapse) ||
        null;

      nodes.forEach(function (el) {
        try {
          el.setAttribute("data-bs-collapse-init", "");
          if (!CollapseClass) return;
          var selector =
            el.getAttribute("data-bs-target") || el.getAttribute("href");
          if (!selector) return;
          document.querySelectorAll(selector).forEach(function (target) {
            CollapseClass.getOrCreateInstance(target, { toggle: false });
          });
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  markAndInitCollapses(document);
  if (window.reinitCollapses) window.reinitCollapses(document);

  try {
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.addedNodes && m.addedNodes.length) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n && n.nodeType === 1) {
              markAndInitCollapses(n);
              if (window.reinitCollapses) window.reinitCollapses(n);
            }
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    console.error(e);
  }

  if (window.jQuery && window.jQuery(document).ajaxComplete) {
    window.jQuery(document).ajaxComplete(function () {
      markAndInitCollapses(document);
      if (window.reinitCollapses) window.reinitCollapses(document);
    });
  }
})();
