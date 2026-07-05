(function () {
  'use strict';

  var STORAGE_KEY = 'ahnoud-market-recent';
  var MAX_RECENT = 8;

  var SOURCES = [
    {
      id: 'dubicars',
      name: 'Dubicars',
      desc: 'Large UAE inventory · new & used · dealer listings',
      buildUrl: function (q) {
        return 'https://www.dubicars.com/search?keyword=' + encodeURIComponent(q);
      },
    },
    {
      id: 'dubizzle',
      name: 'Dubizzle Motors',
      desc: 'Private & dealer ads across the UAE',
      buildUrl: function (q) {
        return 'https://uae.dubizzle.com/motors/used-cars/?keyword=' + encodeURIComponent(q);
      },
    },
    {
      id: 'yallamotor',
      name: 'YallaMotor',
      desc: 'Used car marketplace · specs & price filters',
      buildUrl: function (q) {
        return 'https://uae.yallamotor.com/used-cars/search?q=' + encodeURIComponent(q);
      },
    },
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function readRecent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_e) {
      return [];
    }
  }

  function writeRecent(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
    } catch (_e) {
      /* ignore quota errors */
    }
  }

  function buildQuery() {
    var makeModel = ($('query').value || '').trim();
    var year = ($('year').value || '').trim();
    var parts = [];
    if (makeModel) parts.push(makeModel);
    if (year) parts.push(year);
    return parts.join(' ').trim();
  }

  function rememberSearch(q) {
    if (!q) return;
    var recent = readRecent().filter(function (item) {
      return item.q !== q;
    });
    recent.unshift({ q: q, at: Date.now() });
    writeRecent(recent);
    renderRecent();
  }

  function openUrl(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function renderSources(q) {
    var grid = $('source-grid');
    grid.innerHTML = '';

    SOURCES.forEach(function (source) {
      var url = source.buildUrl(q);
      var card = document.createElement('article');
      card.className = 'source-card';
      card.innerHTML =
        '<div class="source-head">' +
        '<h3>' + source.name + '</h3>' +
        '<span class="source-tag">Live listings</span>' +
        '</div>' +
        '<p class="source-desc">' + source.desc + '</p>' +
        '<div class="source-actions">' +
        '<a class="btn btn-secondary" href="' + url + '" target="_blank" rel="noopener noreferrer">Open search</a>' +
        '</div>' +
        '<p class="source-url" title="' + url + '">' + url + '</p>';
      grid.appendChild(card);
    });

    $('results-panel').hidden = !q;
    $('results-query').textContent = q;
  }

  function renderRecent() {
    var list = readRecent();
    var wrap = $('recent-list');
    var section = $('recent-section');
    wrap.innerHTML = '';

    if (!list.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    list.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'recent-row';

      var label = document.createElement('button');
      label.type = 'button';
      label.className = 'recent-query';
      label.textContent = item.q;
      label.addEventListener('click', function () {
        $('query').value = item.q;
        runSearch(false);
      });

      var when = document.createElement('span');
      when.className = 'recent-when';
      when.textContent = formatWhen(item.at);

      var openAll = document.createElement('button');
      openAll.type = 'button';
      openAll.className = 'btn btn-ghost btn-sm';
      openAll.textContent = 'Open all';
      openAll.addEventListener('click', function () {
        openAllSources(item.q);
      });

      row.appendChild(label);
      row.appendChild(when);
      row.appendChild(openAll);
      wrap.appendChild(row);
    });
  }

  function formatWhen(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  function openAllSources(q) {
    if (!q) return;
    SOURCES.forEach(function (source) {
      openUrl(source.buildUrl(q));
    });
  }

  function runSearch(remember) {
    var q = buildQuery();
    var hint = $('search-hint');

    if (!q) {
      hint.textContent = 'Enter a make and model to build search links.';
      hint.classList.add('hint-warn');
      $('results-panel').hidden = true;
      return;
    }

    hint.textContent = 'Links ready — prices appear on each listing site when you open them.';
    hint.classList.remove('hint-warn');
    renderSources(q);
    if (remember !== false) rememberSearch(q);
  }

  function init() {
    $('search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(true);
    });

    $('open-all').addEventListener('click', function () {
      var q = buildQuery();
      if (!q) {
        $('search-hint').textContent = 'Enter a make and model first.';
        $('search-hint').classList.add('hint-warn');
        return;
      }
      runSearch(true);
      openAllSources(q);
    });

    $('clear-recent').addEventListener('click', function () {
      writeRecent([]);
      renderRecent();
    });

    renderRecent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
