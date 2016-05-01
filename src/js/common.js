'use strict';

(function () {
  detectIE10();
  detectIE11();
  catchKeys();

  // submit form on CTRL+ENTER
  function catchKeys() {
    $(document).on('keydown', function (event) {
      if (event.ctrlKey && event.keyCode === 13) {
        var $target = $(event.target);
        // first let's try to sumbit parents form if it exist.
        var $form = $target.parents('form');
        if ($form.length === 0) {
          $form = $('form');
        }
        if ($form.length === 1) {
          var btn = $form.find('button[type=submit]');
          //workaround from $form.submit() to prevent submitting
          btn.click();
        }
      }
    });
  }

  function detectIE10() {
    if (Function('/*@cc_on return document.documentMode===10@*/')()) {
      document.documentElement.className += ' ie10';
    }
  }

  function detectIE11() {
    if (!!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      document.documentElement.className += ' ie11';
    }
  }

})();