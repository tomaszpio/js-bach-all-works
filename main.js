    const categories = [
      { name: 'Kantaty', start: 1, end: 224 },
      { name: 'Motety', start: 225, end: 231 },
      { name: 'Msze i Magnificaty', start: 232, end: 243 },
      { name: 'Pasje i oratoria', start: 244, end: 249 },
      { name: 'Czterogłosowe chorały', start: 250, end: 438 },
      { name: 'Pieśni i arie', start: 439, end: 518 },
      { name: 'Pieśni sakralne', start: 519, end: 523 },
      { name: 'Quodlibet', start: 524, end: 524 },
      { name: 'Sonaty', start: 525, end: 530 },
      { name: 'Preludia, toccaty, fugi, fantazje, passacaglie', start: 531, end: 582 },
      { name: 'Tria', start: 583, end: 586 },
      { name: 'Różne utwory', start: 587, end: 591 },
      { name: 'Koncerty', start: 592, end: 597 },
      { name: 'Ćwiczenia pedałowe', start: 598, end: 598 },
      { name: 'Preludia chorałowe', start: 599, end: 765 },
      { name: 'Partity i wariacje chorałowe', start: 766, end: 771 },
      { name: 'Inwencje', start: 772, end: 786 },
      { name: 'Sinfonie', start: 787, end: 801 },
      { name: 'Duety', start: 802, end: 805 },
      { name: 'Suity angielskie', start: 806, end: 811 },
      { name: 'Suity francuskie', start: 812, end: 817 },
      { name: 'Różne suity', start: 818, end: 824 },
      { name: 'Partity', start: 825, end: 830 },
      { name: 'Uwertury i suity', start: 831, end: 845 },
      { name: 'Preludia, fugi, fantazje, toccaty', start: 846, end: 920 },
      { name: 'Preludia', start: 921, end: 943 },
      { name: 'Fugi i fughetty', start: 944, end: 962 },
      { name: 'Sonaty i części sonat', start: 963, end: 970 },
      { name: 'Koncerty (klawiszowe)', start: 971, end: 987 },
      { name: 'Wariacje i różne utwory', start: 988, end: 994 },
      { name: 'Na instrument solo', start: 995, end: 1013 },
      { name: 'Na dwa lub więcej instrumentów', start: 1014, end: 1040 },
      { name: 'Koncerty (orkiestrowe)', start: 1041, end: 1065 },
      { name: 'Uwertury i suity (orkiestrowe)', start: 1066, end: 1070 },
      { name: 'Kanony', start: 1072, end: 1078 },
      { name: 'Późne utwory kontrapunktyczne', start: 1079, end: 1080 },
      { name: 'Nowsze dodatki do BWV', start: 1081, end: 1177 },
    { name: 'Utwory fragmentaryczne, zaginione, wątpliwe i fałszywe', prefix: 'Anh.' }
  ];

  function normalizeBwv(value) {
    const anh = value.match(/^Anh\.(\d+)/i);
    if (anh) {
      return 'Anh.' + String(parseInt(anh[1], 10));
    }
    if (/^\d+$/.test(value)) {
      return String(parseInt(value, 10));
    }
    return value.trim();
  }

  function makeSortable(table) {
    const headers = table.querySelectorAll('th');
    headers.forEach((th, index) => {
      let asc = true;
      th.addEventListener('click', () => {
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a, b) => {
          const A = a.children[index].textContent.trim();
          const B = b.children[index].textContent.trim();
          const numA = parseFloat(A);
          const numB = parseFloat(B);
          if (!isNaN(numA) && !isNaN(numB)) {
            return asc ? numA - numB : numB - numA;
          }
          return asc ? A.localeCompare(B) : B.localeCompare(A);
        });
        asc = !asc;
        rows.forEach(r => tbody.appendChild(r));
      });
    });
  }

  function updateColumnVisibility() {
    document.querySelectorAll('#column-toggles input').forEach(cb => {
      const index = parseInt(cb.dataset.col, 10) + 1;
      const display = cb.checked ? '' : 'none';
      document.querySelectorAll(`#works table`).forEach(table => {
        table.querySelectorAll(`th:nth-child(${index}), td:nth-child(${index})`).forEach(cell => {
          cell.style.display = display;
        });
      });
    });
  }

  document.querySelectorAll('#column-toggles input').forEach(cb => {
    cb.addEventListener('change', updateColumnVisibility);
  });
  function applyFilters() {
    const city = document.getElementById('city-filter').value;
    const from = parseInt(document.getElementById('date-from').value, 10);
    const to = parseInt(document.getElementById('date-to').value, 10);
    document.querySelectorAll('#works tbody tr').forEach(tr => {
      const rowCity = tr.children[5].textContent.trim();
      const dateStr = tr.children[4].textContent.trim();
      const match = dateStr.match(/\d{4}/);
      const year = match ? parseInt(match[0], 10) : null;
      let show = true;
      if (city && rowCity !== city) show = false;
      if (from && (!year || year < from)) show = false;
      if (to && (!year || year > to)) show = false;
      tr.style.display = show ? '' : 'none';
    });
  }

  document.getElementById('city-filter').addEventListener('change', applyFilters);
  document.getElementById('date-from').addEventListener('input', applyFilters);
  document.getElementById('date-to').addEventListener('input', applyFilters);

  function createMap(cities) {
    const cityInfo = {
      'Arnstadt': { coords: [50.836, 10.948], years: '1703–1707' },
      'Köthen': { coords: [51.75, 11.97], years: '1717–1723' },
      'Leipzig': { coords: [51.3397, 12.3731], years: '1723–1750' },
      'Lüneburg': { coords: [53.246, 10.414], years: '1700–1702' },
      'Mühlhausen': { coords: [51.21, 10.452], years: '1707–1708' },
      'Ohrdruf': { coords: [50.82, 10.729], years: '1695–1700' },
      'Weimar': { coords: [50.979, 11.329], years: '1708–1717' }
    };
    const bounds = [[47.2701, 5.8663], [55.0581, 15.0419]];
    const map = L.map('map', {
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 6
    }).fitBounds(bounds);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\u00a9 OpenStreetMap',
      noWrap: true
    }).addTo(map);
    cities.forEach(city => {
      const info = cityInfo[city];
      if (info) {
        const popup = info.years ? `${city}: ${info.years}` : city;
        L.marker(info.coords).addTo(map).bindPopup(popup);
      }
    });
  }

    async function loadData() {
      const works = await fetch('works.json').then(res => res.json());
      const files = ['Bacholoji.csv', 'Bachstiftung.csv', 'Netherlands_Bach_Society.csv'];
      const videoMap = {};
      for (const file of files) {
        try {
          const buffer = await fetch(file).then(res => res.arrayBuffer());
          const bytes = new Uint8Array(buffer);
          let csv;
          if (bytes[0] === 0xff && bytes[1] === 0xfe) {
            csv = new TextDecoder('utf-16le').decode(bytes);
          } else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
            csv = new TextDecoder('utf-16be').decode(bytes);
          } else {
            csv = new TextDecoder('utf-8').decode(bytes);
          }
          csv.split(/\r?\n/).forEach(line => {
            if (!line.trim()) return;
            const [title, id, lengthStr] = line.split(';');
            if (!title || !id) return;
            const match = title.match(/BWV\s*(Anh\.\s*)?(\d+)/i);
            if (!match) return;
            const bwv = normalizeBwv(`${match[1] || ''}${match[2]}`);
            const length = parseFloat(lengthStr) || 0;
            const url = `https://youtu.be/${id.trim()}`;
            if (!videoMap[bwv]) videoMap[bwv] = [];
            videoMap[bwv].push({ url, length, file, title });
          });
        } catch (e) {
          console.warn('Nie można wczytać pliku', file, e);
        }
      }
      const container = document.getElementById('works');
      categories.forEach(cat => {
          const heading = document.createElement('h2');
          heading.textContent = cat.name;
          container.appendChild(heading);

          const table = document.createElement('table');
          table.className = 'table is-striped is-hoverable is-fullwidth';
          const wrapper = document.createElement('div');
          wrapper.classList.add('table-container', 'collapsed');
          wrapper.appendChild(table);
          heading.addEventListener('click', () => {
            wrapper.classList.toggle('collapsed');
          });
          const thead = document.createElement('thead');
          // Kolumna "Miasto" może pozostać pusta, jeśli brak danych o miejscu powstania
          thead.innerHTML = `<tr><th>BWV</th><th>BC</th><th>Tytuł</th><th>Tonacja</th><th>Data</th><th>Miasto</th><th>Gatunek</th><th>Obsada</th><th>Uwagi</th><th>Tekst</th><th>Video</th></tr>`;
          table.appendChild(thead);
          const tbody = document.createElement('tbody');
          table.appendChild(tbody);

          works.filter(row => {
            const bwv = normalizeBwv(row.BWV);
            if (cat.prefix) {
              return bwv.startsWith(cat.prefix);
            }
            const num = parseInt(bwv, 10);
            return !isNaN(num) && num >= cat.start && num <= cat.end;
          }).forEach(row => {
            const tr = document.createElement('tr');
            const bwvNorm = normalizeBwv(row.BWV);
            const entries = (videoMap[bwvNorm] || [])
              .slice()
              .sort((a, b) => b.length - a.length);
            const textUrl = `http://kbpp.org.pl/bwv-${bwvNorm.toLowerCase().replace(/\s+/g, '').replace('.', '-')}`;
            const videoLinks = entries.map(e => {
              const len = e.length ? `${e.length}s` : '';
              const label = e.file.replace('.csv', '');
              return `<a href="${e.url}" target="_blank">${label}: ${e.title}${len ? ` (${len})` : ''}</a>`;
            }).join('<br>');
            tr.innerHTML = `
              <td>${row.BWV}</td>
              <td>${row.BC}</td>
              <td>${row.Title}</td>
              <td>${row.Key}</td>
              <td>${row.Date}</td>
              <td>${row.City || ''}</td>
              <td>${row.Genre}</td>
              <td>${row.Forces}</td>
              <td>${row.Notes}</td>
              <td><a href="${textUrl}" target="_blank">tekst</a></td>
              <td>${videoLinks}</td>
            `;
            tbody.appendChild(tr);
          });

          makeSortable(table);
          container.appendChild(wrapper);
        });
        const cities = [...new Set(works.map(w => w.City).filter(Boolean))].sort();
        const cityFilter = document.getElementById('city-filter');
        cities.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          cityFilter.appendChild(opt);
        });
        updateColumnVisibility();
        applyFilters();
        createMap(cities);
        document.dispatchEvent(new Event('dataLoaded'));
      }

  loadData().catch(err => console.error('Błąd wczytywania danych', err));
