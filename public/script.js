// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const targetAMBInput = document.getElementById('targetAMB');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
            handleFileUpload(file);
        } else {
            showError('Please upload a valid PDF file');
        }
    }
});

// Handle File Selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

// Handle File Upload
async function handleFileUpload(file) {
    const targetAMB = parseFloat(targetAMBInput.value) || 5000;
    
    // Show loading
    uploadSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('targetAMB', targetAMB);
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        
        const response_data = await response.json();
        
        if (response_data.error) {
            throw new Error(response_data.error);
        }
        
        // Server returns { success: true, data: {...} }
        displayResults(response_data.data);
    } catch (error) {
        showError(error.message);
    } finally {
        loadingSection.classList.add('hidden');
    }
}

// Display Results
function displayResults(results) {
    // results contains all the data from calculateAMB
    
    // Status Banner
    const statusBanner = document.getElementById('statusBanner');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    
    if (results.status === 'ON_TRACK') {
        statusBanner.classList.remove('warning');
        statusBanner.classList.add('success');
        statusIcon.textContent = '✅';
        statusText.textContent = 'Great! You are on track with your AMB';
    } else {
        statusBanner.classList.remove('success');
        statusBanner.classList.add('warning');
        statusIcon.textContent = '⚠️';
        statusText.textContent = 'Alert! You are below the target AMB';
    }
    
    // Summary Grid
    document.getElementById('statementPeriod').textContent = results.statementPeriod || '-';
    document.getElementById('daysElapsed').textContent = results.daysElapsed;
    document.getElementById('remainingDays').textContent = results.remainingDays;
    document.getElementById('totalDays').textContent = results.totalDaysInMonth;
    
    // Current Status
    document.getElementById('currentBalance').textContent = formatCurrency(results.currentBalance);
    document.getElementById('currentAMB').textContent = formatCurrency(results.currentAMB);
    document.getElementById('targetAMBDisplay').textContent = formatCurrency(results.targetAMB);
    
    // Calculations
    document.getElementById('sumDailyBalances').textContent = formatCurrency(results.sumOfDailyBalances);
    document.getElementById('requiredTotalSum').textContent = formatCurrency(results.requiredTotalSum);
    document.getElementById('remainingSumNeeded').textContent = formatCurrency(results.remainingSumNeeded);
    
    // Action Box
    const actionBox = document.getElementById('actionBox');
    const actionContent = document.getElementById('actionContent');
    
    if (results.status === 'ON_TRACK' && results.surplus > 0) {
        actionBox.classList.remove('warning');
        actionBox.classList.add('success');
        actionContent.innerHTML = `
            <strong>Excellent! 🎉</strong>
            <p>You have a surplus of ${formatCurrency(results.surplus)} above your target AMB!</p>
            <p>You've already accumulated ${formatCurrency(results.surplus)} MORE than needed.</p>
            <p>You can maintain ₹0 balance for the remaining ${results.remainingDays} days and still meet your target.</p>
        `;
    } else if (results.requiredBalanceForRemainingDays <= 0) {
        actionBox.classList.remove('warning');
        actionBox.classList.add('success');
        actionContent.innerHTML = `
            <strong>Perfect! Target achieved! ✅</strong>
            <p>You can maintain ₹0 balance for the remaining ${results.remainingDays} days and still meet your target.</p>
        `;
    } else if (results.deficit > 0) {
        actionBox.classList.remove('success');
        actionBox.classList.add('warning');
        actionContent.innerHTML = `
            <strong>Action Required! ⚠️</strong>
            <p>You need to add ${formatCurrency(results.deficit)} to your account.</p>
            <p>Maintain at least ${formatCurrency(results.requiredBalanceForRemainingDays)} for the remaining ${results.remainingDays} days to meet your target.</p>
        `;
    } else {
        actionBox.classList.remove('warning');
        actionBox.classList.add('success');
        actionContent.innerHTML = `
            <strong>Good news! ✅</strong>
            <p>Your current balance is sufficient.</p>
            <p>Maintain at least ${formatCurrency(results.requiredBalanceForRemainingDays)} for the remaining ${results.remainingDays} days.</p>
        `;
    }
    
    // Transaction History
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';
    
    results.transactions.forEach(txn => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatDate(txn.date)}</td>
            <td>${formatCurrency(txn.closingBalance)}</td>
        `;
    });
    
    // Show results
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    uploadSection.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        errorSection.classList.add('hidden');
    }, 10000);
}

// Upload Another File
// Upload Another File / Reset App
function uploadAnother() {
    fileInput.value = '';
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
}

function resetApp() {
    uploadAnother();
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format Date
function formatDate(dateStr) {
    // dateStr is in DD/MM/YYYY format from Indian locale
    // JavaScript's Date() interprets it as MM/DD/YYYY (US format)
    // So we need to parse it correctly
    const parts = dateStr.split('/');
    
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }
    
    // Fallback if format is unexpected
    return dateStr;
}

// Make functions available globally
window.uploadAnother = uploadAnother;
window.resetApp = resetApp;
