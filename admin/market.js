(function () {
  'use strict';

  var STORAGE_KEY = 'ahnoud-market-recent';
  var MAX_RECENT = 8;
  var API_URL = '/api/market/search';

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatAed(amount) {
    if (amount == null) return '—';
    return 'AED ' + Number(amount).toLocaleString('en-AE');
  }

  function formatKm(km) {
    if (km == null) return '—';
    return Number(km).toLocaleString('en-AE') + ' km';
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
      /* ignore */
    }
  }

  function buildQuery() {
    var makeModel = ($('query').value || '').trim();
    var year = ($('year').value || '').trim();
    if (!makeModel) return { q: '', year: '' };
    return { q: makeModel, year: year };
  }

  function rememberSearch(queryText) {
    if (!queryText) return;
    var recent = readRecent().filter(function (item) {
      return item.q !== queryText;
    });
    recent.unshift({ q: queryText, at: Date.now() });
    writeRecent(recent);
    renderRecent();
  }

  function formatWhen(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  function setLoading(isLoading) {
    $('search-btn').disabled = isLoading;
    $('search-btn').textContent = isLoading ? 'Searching…' : 'Search market';
    $('loading-panel').hidden = !isLoading;
  }

  function renderSummary(data) {
    var summary = data.summary || {};
    var panel = $('summary-panel');
    if (!summary.count) {
      panel.hidden = true;
      return;
    }

    panel.hidden = false;
    $('summary-count').textContent = summary.count + ' listings';
    $('summary-min').textContent = formatAed(summary.min_aed);
    $('summary-max').textContent = formatAed(summary.max_aed);
    $('summary-median').textContent = formatAed(summary.median_aed);
    var sub = $('summary-sub');
    sub.hidden = false;
    sub.textContent = (data.cached ? 'Cached result' : 'Live scrape') + ' · Query: ' + data.query;
  }

  function renderSources(sources) {
    var grid = $('sources-grid');
    grid.innerHTML = '';

    (sources || []).forEach(function (source) {
      var card = document.createElement('article');
      card.className = 'source-card status-' + source.status;
      var statusLabel = source.status;
      if (source.status === 'ok') statusLabel = source.count + ' found';
      if (source.status === 'blocked') statusLabel = 'Blocked';

      card.innerHTML =
        '<div class="source-head">' +
        '<h3>' + escapeHtml(source.name) + '</h3>' +
        '<span class="source-tag">' + escapeHtml(statusLabel) + '</span>' +
        '</div>' +
        (source.message ? '<p class="source-desc">' + escapeHtml(source.message) + '</p>' : '') +
        (source.search_url
          ? '<a class="btn btn-secondary btn-sm" href="' + escapeHtml(source.search_url) + '" target="_blank" rel="noopener noreferrer">Open on site</a>'
          : '');

      grid.appendChild(card);
    });
  }

  function renderListings(listings) {
    var tbody = $('listings-body');
    var panel = $('listings-panel');
    tbody.innerHTML = '';

    if (!listings || !listings.length) {
      panel.hidden = true;
      return;
    }

    panel.hidden = false;
    listings.forEach(function (item) {
      var row = document.createElement('tr');
      row.innerHTML =
        '<td><span class="source-pill">' + escapeHtml(item.source) + '</span></td>' +
        '<td><a class="listing-title" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.title) + '</a></td>' +
        '<td>' + escapeHtml(item.year || '—') + '</td>' +
        '<td>' + escapeHtml(formatKm(item.km)) + '</td>' +
        '<td class="price-cell">' + escapeHtml(formatAed(item.price_aed)) + '</td>' +
        '<td>' + escapeHtml(item.condition || '—') + '</td>';
      tbody.appendChild(row);
    });
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
        var parts = item.q.split(' ');
        var maybeYear = parts[parts.length - 1];
        if (/^\d{4}$/.test(maybeYear)) {
          $('year').value = maybeYear;
          $('query').value = parts.slice(0, -1).join(' ');
        } else {
          $('query').value = item.q;
          $('year').value = '';
        }
        runSearch(false);
      });

      var when = document.createElement('span');
      when.className = 'recent-when';
      when.textContent = formatWhen(item.at);

      row.appendChild(label);
      row.appendChild(when);
      wrap.appendChild(row);
    });
  }

  function showError(message) {
    var hint = $('search-hint');
    hint.textContent = message;
    hint.classList.add('hint-warn');
    $('summary-panel').hidden = true;
    $('listings-panel').hidden = true;
    $('sources-panel').hidden = true;
  }

  function renderResults(data) {
    $('results-panel').hidden = false;
    $('sources-panel').hidden = false;
    $('search-hint').textContent = 'Results from live listing pages. Open any row to verify on the source site.';
    $('search-hint').classList.remove('hint-warn');
    renderSummary(data);
    renderSources(data.sources);
    renderListings(data.listings);
  }

  async function runSearch(remember) {
    var params = buildQuery();
    if (!params.q) {
      showError('Enter a make and model to search.');
      return;
    }

    var url = API_URL + '?q=' + encodeURIComponent(params.q);
    if (params.year) url += '&year=' + encodeURIComponent(params.year);

    setLoading(true);
    $('results-panel').hidden = true;

    try {
      var response = await fetch(url);
      var data = await response.json();
      if (!response.ok) {
        var detail = data && data.detail;
        if (Array.isArray(detail)) detail = detail.map(function (d) { return d.msg; }).join(', ');
        throw new Error(detail || 'Search failed.');
      }

      if (!data.summary || !data.summary.count) {
        showError('No listings found. Try a broader make/model or check source links below.');
        renderSources(data.sources || []);
        $('results-panel').hidden = false;
        $('sources-panel').hidden = false;
      } else {
        renderResults(data);
      }

      if (remember !== false) rememberSearch(data.query);
    } catch (err) {
      showError(err.message || 'Could not reach the market scraper.');
    } finally {
      setLoading(false);
    }
  }

  function init() {
    $('search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(true);
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
