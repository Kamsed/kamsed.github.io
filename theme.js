/* ------------------------------------------------------------------
   全站主题设置
   - 读写 localStorage['theme']，同步到 <html data-theme>
   - 页面里有 #theme-toggle 的按钮会自动接上，没有也不报错
   - 放在 <head> 里同步加载，首屏就不会闪一下
   - 对外接口：window.__theme.get() / set(mode) / onChange(fn)
   ------------------------------------------------------------------ */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  var modes = ['auto', 'light', 'dark'];
  var labels = { auto: '自动', light: '🔆', dark: '🌙' };

  function normalize(v) {
    return modes.indexOf(v) > -1 ? v : 'auto';
  }

  function remember(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function label(mode) {
    return labels[mode] || mode;
  }

  function paint(mode, btn) {
    root.dataset.theme = mode;
    if (btn) {
      btn.textContent = label(mode);
      btn.setAttribute('aria-label', '切换颜色主题，当前：' + label(mode));
    }
    document.dispatchEvent(new CustomEvent('themechange', { detail: { mode: mode } }));
  }

  var stored = 'auto';
  try { stored = normalize(localStorage.getItem(KEY)); } catch (e) {}

  /* 首屏先定下来 */
  root.dataset.theme = stored;

  function wire() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    paint(root.dataset.theme, btn);
    btn.addEventListener('click', function () {
      var next = modes[(modes.indexOf(normalize(root.dataset.theme)) + 1) % modes.length];
      remember(next);
      paint(next, btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }

  window.__theme = {
    modes: modes,
    get: function () { return normalize(root.dataset.theme); },
    set: function (mode) {
      var v = normalize(mode);
      remember(v);
      paint(v, document.getElementById('theme-toggle'));
    },
    onChange: function (fn) {
      document.addEventListener('themechange', fn);
    }
  };
})();
