const CONSTANTS = { NET_FACTOR: 0.8696 };

let appState = {
    steamPrice: 2.16,
    binancePrice: 1.62,
    rows: [], 
    history: []
};

const el = {
    steamPrice: document.getElementById('steamPrice'),
    binancePrice: document.getElementById('binancePrice'),
    tableBody: document.getElementById('gamesTableBody'),
    emptyState: document.getElementById('emptyState'),
    mainTable: document.getElementById('mainTable'),
    historyContainer: document.getElementById('historyContainer'),
    emptyHistory: document.getElementById('emptyHistory'),
    themeBtn: document.getElementById('themeBtn')
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadTheme();
    
    el.steamPrice.addEventListener('input', (e) => {
        appState.steamPrice = parseFloat(e.target.value) || 0;
        saveSettings();
        renderTable();
    });

    el.binancePrice.addEventListener('input', (e) => {
        appState.binancePrice = parseFloat(e.target.value) || 0;
        saveSettings();
        renderTable();
    });

    renderTable();
    renderHistory();
});

function addNewRow() {
    appState.rows.push({ id: Date.now(), name: "", arp: "", keys: "" });
    saveSettings();
    renderTable();
}

function updateRow(id, field, value) {
    const row = appState.rows.find(r => r.id === id);
    if (row) {
        row[field] = (field === 'arp' || field === 'keys') ? (value === "" ? "" : parseFloat(value)) : value;
        saveSettings();
        updateRowCalculations(id);
        recalculateColors();
    }
}

function deleteRow(id) {
    appState.rows = appState.rows.filter(r => r.id !== id);
    saveSettings();
    renderTable();
}

function clearTable() {
    if(appState.rows.length > 0 && confirm('¿Limpiar tabla?')) {
        appState.rows = [];
        saveSettings();
        renderTable();
    }
}

function renderTable() {
    el.tableBody.innerHTML = '';
    if (appState.rows.length === 0) {
        el.emptyState.classList.remove('d-none');
        el.mainTable.classList.add('d-none');
        return;
    } else {
        el.emptyState.classList.add('d-none');
        el.mainTable.classList.remove('d-none');
    }

    appState.rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.dataset.id = row.id;
        tr.innerHTML = `
            <td class="ps-4"><input type="text" class="table-input fw-bold" placeholder="Nombre..." value="${row.name}" oninput="updateRow(${row.id}, 'name', this.value)"></td>
            <td class="text-center"><input type="number" class="table-input text-center" placeholder="0" value="${row.arp}" oninput="updateRow(${row.id}, 'arp', this.value)"></td>
            <td class="text-center"><input type="number" class="table-input text-center text-info fw-bold" placeholder="0" value="${row.keys}" oninput="updateRow(${row.id}, 'keys', this.value)"></td>
            <td class="text-center text-secondary calc-net-steam font-monospace" style="font-size:0.8rem">-</td>
            <td class="text-center text-secondary calc-binance font-monospace" style="font-size:0.8rem">-</td>
            <td class="text-center"><span class="badge-ratio bg-mid calc-ratio">-</span></td>
            <td class="text-center"><i class="fa-solid fa-xmark text-danger opacity-50" style="cursor:pointer" onclick="deleteRow(${row.id})"></i></td>
        `;
        el.tableBody.appendChild(tr);
        updateRowCalculations(row.id);
    });
    recalculateColors();
}

function updateRowCalculations(id) {
    const row = appState.rows.find(r => r.id === id);
    const tr = document.querySelector(`tr[data-id="${id}"]`);
    if(!row || !tr) return;
    const arp = parseFloat(row.arp) || 0;
    const keys = parseFloat(row.keys) || 0;
    const netSteam = keys * appState.steamPrice * CONSTANTS.NET_FACTOR;
    const totalBinance = keys * appState.binancePrice;
    tr.querySelector('.calc-net-steam').textContent = netSteam > 0 ? `$${netSteam.toFixed(2)}` : '-';
    tr.querySelector('.calc-binance').textContent = totalBinance > 0 ? `$${totalBinance.toFixed(2)}` : '-';
    const ratioSpan = tr.querySelector('.calc-ratio');
    if (netSteam > 0 && arp > 0) {
        const ratio = arp / netSteam;
        ratioSpan.textContent = ratio.toFixed(2);
        ratioSpan.dataset.value = ratio;
    } else { ratioSpan.textContent = '-'; ratioSpan.dataset.value = 0; }
}

function recalculateColors() {
    const ratios = Array.from(document.querySelectorAll('.calc-ratio')).map(span => parseFloat(span.dataset.value) || 0).filter(val => val > 0);
    if (ratios.length === 0) return;
    const min = Math.min(...ratios);
    const max = Math.max(...ratios);
    document.querySelectorAll('.calc-ratio').forEach(span => {
        const val = parseFloat(span.dataset.value) || 0;
        span.className = 'badge-ratio calc-ratio';
        if (val === 0) { span.classList.add('bg-mid'); return; }
        if (ratios.length > 1) {
            if (val === min) span.classList.add('bg-best');
            else if (val === max) span.classList.add('bg-worst');
            else span.classList.add('bg-mid');
        } else span.classList.add('bg-best');
    });
}

function saveToHistory() {
    const validRows = appState.rows.filter(r => r.name && r.arp && r.keys);
    if (validRows.length === 0) return alert("Completa al menos una fila.");
    const snapshot = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        steamPrice: appState.steamPrice,
        binancePrice: appState.binancePrice,
        rows: JSON.parse(JSON.stringify(validRows))
    };
    appState.history.unshift(snapshot);
    if(appState.history.length > 5) appState.history.pop();
    saveSettings();
    renderHistory();
}

function deleteHistoryItem(id) {
    appState.history = appState.history.filter(h => h.id !== id);
    saveSettings();
    renderHistory();
}

function renderHistory() {
    el.historyContainer.innerHTML = '';
    if(!appState.history || appState.history.length === 0) { el.emptyHistory.style.display = 'block'; return; }
    el.emptyHistory.style.display = 'none';

    appState.history.forEach(item => {
        const rowsWithData = item.rows.map(r => {
            const netSteam = r.keys * item.steamPrice * CONSTANTS.NET_FACTOR;
            const ratio = netSteam > 0 ? (r.arp / netSteam) : 0;
            return { ...r, netSteam, ratio };
        });

        const allRatios = rowsWithData.map(r => r.ratio).filter(v => v > 0);
        const minH = Math.min(...allRatios);
        const maxH = Math.max(...allRatios);
        const bestGame = rowsWithData.find(r => r.ratio === minH)?.name || "-";

        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
             <div class="history-header" onclick="this.parentElement.classList.toggle('open')">
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-primary bg-opacity-10 text-primary rounded p-2"><i class="fa-regular fa-calendar-check"></i></div>
                    <div>
                        <div class="fw-bold small" style="color: var(--text-main)">${item.date}</div>
                        <div class="text-secondary small" style="font-size: 0.75rem;">Steam: $${item.steamPrice} • <span class="text-success fw-bold">Mejor: ${bestGame}</span></div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <i class="fa-solid fa-chevron-down text-secondary small"></i>
                    <button class="btn btn-sm text-secondary opacity-50" onclick="event.stopPropagation(); deleteHistoryItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="history-body">
                <table class="table history-table m-0">
                    <thead><tr><th class="ps-3">JUEGO</th><th class="text-center">ARP</th><th class="text-center">KEYS</th><th class="text-center">NETO</th><th class="text-center">RATIO</th></tr></thead>
                    <tbody>
                        ${rowsWithData.map(r => {
                            let colorClass = "";
                            if (allRatios.length > 1) {
                                if (r.ratio === minH) colorClass = "text-ratio-green";
                                else if (r.ratio === maxH) colorClass = "text-ratio-red";
                                else colorClass = "text-ratio-yellow";
                            } else colorClass = "text-ratio-green";

                            // Aqui quite el text-white forzado del nombre del juego
                            return `<tr>
                                <td class="ps-3 fw-bold" style="color: var(--text-main)">${r.name}</td>
                                <td class="text-center text-secondary">${r.arp}</td>
                                <td class="text-center text-info">${r.keys}</td>
                                <td class="text-center text-secondary">$${r.netSteam.toFixed(2)}</td>
                                <td class="text-center ${colorClass}">${r.ratio > 0 ? r.ratio.toFixed(2) : '-'}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        el.historyContainer.appendChild(div);
    });
}

function saveSettings() {
    localStorage.setItem('steamTradeData_v4', JSON.stringify({
        steamPrice: appState.steamPrice,
        binancePrice: appState.binancePrice,
        rows: appState.rows,
        history: appState.history
    }));
}

function loadSettings() {
    const data = localStorage.getItem('steamTradeData_v4');
    if (data) {
        const parsed = JSON.parse(data);
        appState = { ...appState, ...parsed };
        el.steamPrice.value = appState.steamPrice;
        el.binancePrice.value = appState.binancePrice;
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const next = html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', next);
    localStorage.setItem('steamTradeTheme', next);
    el.themeBtn.querySelector('i').className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function loadTheme() {
    const theme = localStorage.getItem('steamTradeTheme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', theme);
    el.themeBtn.querySelector('i').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}