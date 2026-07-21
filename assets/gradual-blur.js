/* GradualBlur — vanilla port of the React Bits <GradualBlur /> component
   (github.com/ansh-dhanani). Same layer math: N stacked divs, each with a
   band mask + progressively stronger backdrop-filter blur, so page content
   melts gradually at the viewport TOP edge (under the floating nav).
   Static effect — no animation loop, no dependencies, no React. */
(function () {
  'use strict';

  var CONFIG = {
    position: 'top',         // viewport edge
    strength: 2,             // blur multiplier
    height: '6.5rem',        // overlay height
    divCount: 6,             // stacked layers (more = smoother)
    exponential: true,       // stronger end blur
    curve: 'bezier',
    opacity: 1,
    zIndex: 40               // below the floating nav / sticky bar (z-50)
  };

  var CURVES = {
    linear: function (p) { return p; },
    bezier: function (p) { return p * p * (3 - 2 * p); },
    'ease-in': function (p) { return p * p; },
    'ease-out': function (p) { return 1 - Math.pow(1 - p, 2); }
  };

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'gradual-blur gradual-blur-page';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText =
      'position:fixed;left:0;right:0;' + (CONFIG.position === 'top' ? 'top:0' : 'bottom:0') +
      ';width:100%;height:' + CONFIG.height +
      ';pointer-events:none;z-index:' + CONFIG.zIndex + ';isolation:isolate;';

    var inner = document.createElement('div');
    inner.className = 'gradual-blur-inner';
    inner.style.cssText = 'position:relative;width:100%;height:100%;pointer-events:none;';

    var curveFunc = CURVES[CONFIG.curve] || CURVES.linear;
    var increment = 100 / CONFIG.divCount;

    for (var i = 1; i <= CONFIG.divCount; i++) {
      var progress = curveFunc(i / CONFIG.divCount);

      var blurValue = CONFIG.exponential
        ? Math.pow(2, progress * 4) * 0.0625 * CONFIG.strength
        : 0.0625 * (progress * CONFIG.divCount + 1) * CONFIG.strength;

      var p1 = Math.round((increment * i - increment) * 10) / 10;
      var p2 = Math.round(increment * i * 10) / 10;
      var p3 = Math.round((increment * i + increment) * 10) / 10;
      var p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      var gradient = 'transparent ' + p1 + '%, black ' + p2 + '%';
      if (p3 <= 100) gradient += ', black ' + p3 + '%';
      if (p4 <= 100) gradient += ', transparent ' + p4 + '%';

      var mask = 'linear-gradient(' + (CONFIG.position === 'top' ? 'to top' : 'to bottom') + ', ' + gradient + ')';
      var div = document.createElement('div');
      div.style.cssText =
        'position:absolute;inset:0;' +
        '-webkit-mask-image:' + mask + ';mask-image:' + mask + ';' +
        '-webkit-backdrop-filter:blur(' + blurValue.toFixed(3) + 'rem);' +
        'backdrop-filter:blur(' + blurValue.toFixed(3) + 'rem);' +
        'opacity:' + CONFIG.opacity + ';';
      inner.appendChild(div);
    }

    wrap.appendChild(inner);
    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
