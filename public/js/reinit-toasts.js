(function () {
  function markAndInitToasts(root) {
    try {
      root = root || document;
      var nodes = Array.prototype.slice.call(
        root.querySelectorAll
          ? root.querySelectorAll('.toast:not([data-bs-toast-initialized])')
          : []
      );
      if (!nodes.length) return;

      var ToastClass = window.mdb && window.mdb.Toast;
      if (!ToastClass) return;

      nodes.forEach(function (el) {
        try {
          // Initializing registers enableDismissTrigger(Toast) as a global
          // document-level handler for [data-bs-dismiss="toast"] clicks.
          // autohide:false prevents MDB from starting a countdown on already-shown toasts.
          ToastClass.getOrCreateInstance(el, { autohide: false });
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  markAndInitToasts(document);

  try {
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.addedNodes && m.addedNodes.length) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n && n.nodeType === 1) markAndInitToasts(n);
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
      markAndInitToasts(document);
    });
  }
})();
