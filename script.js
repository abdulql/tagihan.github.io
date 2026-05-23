// Format currency to Rupiah
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Get month name in Indonesian
function getMonthName(dateString) {
    const date = new Date(dateString + '-01');
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long'
    }).format(date);
}

// Handle form submission
document.getElementById('billForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateBills();
});

function calculateBills() {
    const pihak1Name = document.getElementById('pihak1Name').value.trim();
    const pihak2Name = document.getElementById('pihak2Name').value.trim();
    const monthValue = document.getElementById('month').value;
    const listrikAC = parseFloat(document.getElementById('listrikAC').value) || 0;
    const air = parseFloat(document.getElementById('air').value) || 0;
    const gas = parseFloat(document.getElementById('gas').value) || 0;
    const potonganSK = parseFloat(document.getElementById('potonganSK').value) || 0;
    const iuranRT = parseFloat(document.getElementById('iuranRT').value) || 0;

    // Validation
    const errorDiv = document.getElementById('errorMessage');
    if (!pihak1Name || !pihak2Name || !monthValue) {
        errorDiv.textContent = '❌ Mohon isi semua field yang diperlukan (Nama Pihak 1, Nama Pihak 2, dan Bulan/Tahun)';
        errorDiv.classList.remove('hidden');
        document.getElementById('resultSection').classList.remove('show');
        return;
    }
    errorDiv.classList.add('hidden');

    // Constants
    const STANDAR_LISTRIK_NON_AC = 90000;
    const HALF = 0.5;

    // Calculations
    const selisihListrik = listrikAC - STANDAR_LISTRIK_NON_AC;
    const listrikPihak1 = STANDAR_LISTRIK_NON_AC * HALF; // 45.000
    const listrikPihak2 = STANDAR_LISTRIK_NON_AC * HALF + selisihListrik; // 45.000 + selisih

    const totalBersama = air + gas + potonganSK + iuranRT;
    const perPihak = totalBersama * HALF;

    const tagihan1 = perPihak + listrikPihak1;
    const tagihan2 = perPihak + listrikPihak2;

    // Total checks
    const totalTagihanAwal = listrikAC + air + gas + potonganSK + iuranRT;
    const totalPembayaran = tagihan1 + tagihan2;
    const isBalance = Math.abs(totalTagihanAwal - totalPembayaran) < 1; // Allow 1 Rp rounding

    // Display month
    const monthName = getMonthName(monthValue);
    document.getElementById('resultMonth').textContent = `Periode: ${monthName}`;

    // Update breakdown display
    document.getElementById('display-listrikAC').textContent = formatCurrency(listrikAC);
    document.getElementById('display-selisihListrik').textContent = formatCurrency(selisihListrik);
    document.getElementById('display-air').textContent = formatCurrency(air);
    document.getElementById('display-gas').textContent = formatCurrency(gas);
    document.getElementById('display-potonganSK').textContent = formatCurrency(potonganSK);
    document.getElementById('display-iuranRT').textContent = formatCurrency(iuranRT);
    document.getElementById('display-totalBersama').textContent = formatCurrency(totalBersama);
    document.getElementById('display-perPihak').textContent = formatCurrency(perPihak);

    // Update summary
    document.getElementById('summaryPihak1Name').textContent = pihak1Name;
    document.getElementById('summaryPihak2Name').textContent = pihak2Name;
    document.getElementById('display-pihak1').textContent = formatCurrency(tagihan1);
    document.getElementById('display-pihak2').textContent = formatCurrency(tagihan2);
    document.getElementById('breakdown-pihak1').textContent = `Rp 45.000 (Listrik) + ${formatCurrency(perPihak)} (Bersama)`;
    document.getElementById('breakdown-pihak2').textContent = `Rp 45.000 + ${formatCurrency(selisihListrik)} (Listrik AC) + ${formatCurrency(perPihak)} (Bersama)`;

    // Update balance check
    document.getElementById('totalAwal').textContent = formatCurrency(totalTagihanAwal);
    document.getElementById('totalAkhir').textContent = formatCurrency(totalPembayaran);

    const balanceStatus = document.getElementById('balanceStatus');
    if (isBalance) {
        balanceStatus.className = 'balance-status success';
        balanceStatus.textContent = '✅ BALANCE - Perhitungan Seimbang!';
    } else {
        balanceStatus.className = 'balance-status error';
        balanceStatus.textContent = `❌ TIDAK BALANCE - Selisih: ${formatCurrency(Math.abs(totalTagihanAwal - totalPembayaran))}`;
    }

    // Show result
    document.getElementById('resultSection').classList.add('show');
    document.getElementById('downloadBtn').disabled = false;

    // Scroll to result
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// Download as image
document.getElementById('downloadBtn').addEventListener('click', function() {
    const element = document.getElementById('resultContent');
    const opt = {
        margin: 10,
        filename: `Pembayaran-${new Date().toISOString().split('T')[0]}.png`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // Load html2canvas and jsPDF from CDN
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    
    script1.onload = function() {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        
        script2.onload = function() {
            html2canvas(element, opt.html2canvas).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = opt.filename;
                link.click();
            });
        };
        document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
});

// Set today's date as default month
document.getElementById('month').valueAsDate = new Date();
