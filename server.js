const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * Parse date from DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY, or DD-MM-YY format
 */
function parseDate(dateStr) {
    const parts = dateStr.split(/[\/\-]/); // Split by / or -
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]) - 1; // Month is 0-indexed
    let year = parseInt(parts[2]);
    
    // Handle 2-digit year
    if (year < 100) {
        year += 2000;
    }
    
    return new Date(year, month, day);
}

/**
 * Parse HDFC bank statement PDF and extract transaction data
 */
async function parseBankStatement(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        let text = data.text;
        
        // Debug: Log extracted text details
        console.log('📄 PDF Text Preview (first 1000 chars):\n', text.substring(0, 1000));
        console.log('\n📄 Total text length:', text.length);
        console.log('\n📋 First 50 lines of PDF:');
        text.split('\n').slice(0, 50).forEach((line, i) => {
            if (line.trim()) console.log(`${i}: ${line.trim()}`);
        });
        
        // Try multiple date pattern formats
        let periodMatch = text.match(/From\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4}).*?To\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/is);
        
        if (!periodMatch) {
            // Try alternative format without colons
            periodMatch = text.match(/From\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4}).*?To\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})/is);
        }
        
        if (!periodMatch) {
            // Try looking for "Period" keyword
            periodMatch = text.match(/Period\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+to\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})/is);
        }
        
        if (!periodMatch) {
            // Try Statement Period format
            periodMatch = text.match(/Statement\s+Period\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+to\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})/is);
        }
        
        if (!periodMatch) {
            console.log('❌ Could not find statement period. Trying to extract dates from anywhere in document...');
            // Last resort: find ANY two dates in DD/MM/YYYY format
            const allDates = text.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/g);
            if (allDates && allDates.length >= 2) {
                console.log(`� Found ${allDates.length} dates in PDF, using first and last as period`);
                periodMatch = [null, allDates[0], allDates[allDates.length - 1]];
            }
        }
        
        if (!periodMatch) {
            console.log('❌ Could not find any valid dates in PDF');
            throw new Error('Could not find statement period in PDF. Please ensure this is a valid HDFC bank statement.');
        }
        
        const fromDate = parseDate(periodMatch[1]);
        const toDate = parseDate(periodMatch[2]);
        
        console.log(`📅 Statement Period: ${periodMatch[1]} to ${periodMatch[2]}`);
        
        const transactions = [];
        const lines = text.split('\n');
        
        console.log(`📝 Processing ${lines.length} lines...`);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('STATEMENT SUMMARY')) {
                break;
            }
            
            if (!line || line.includes('Narration') || line.includes('Closing Balance') || line.includes('Statement of account')) {
                continue;
            }
            
            // Match date at start of line - HDFC format has NO SPACE after date
            // Format: DD/MM/YYTRANSACTION... or DD/MM/YY TRANSACTION...
            const dateMatch = line.match(/^(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/);
            
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const date = parseDate(dateStr);
                
                let combinedText = line;
                
                // Combine multi-line transactions
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    
                    if (nextLine.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/) || nextLine.includes('STATEMENT SUMMARY')) {
                        break;
                    }
                    
                    combinedText += ' ' + nextLine;
                    
                    // Stop when we find a line with closing balance pattern
                    if (nextLine.match(/\d{1,3}(?:,\d{3})*\.\d{2}$/)) {
                        break;
                    }
                }
                
                // Extract closing balance - it's the LAST decimal number on the line
                // Format: ...10.0010.00 or ...7,770.00231.00
                const allNumbers = combinedText.match(/\d{1,3}(?:,\d{3})*\.\d{2}/g);
                
                if (allNumbers && allNumbers.length > 0) {
                    // The last number is always the closing balance
                    const closingBalanceStr = allNumbers[allNumbers.length - 1];
                    const closingBalance = parseFloat(closingBalanceStr.replace(/,/g, ''));
                    
                    console.log(`  Found: ${dateStr} -> Balance: ${closingBalance}`);
                    
                    if (!isNaN(closingBalance) && closingBalance >= 0) {
                        transactions.push({
                            date: date,
                            closingBalance: closingBalance
                        });
                    }
                }
            }
        }
        
        console.log(`✅ Found ${transactions.length} raw transactions`);
        
        // Group by date - keep the LAST closing balance per date (end of day)
        const dateMap = new Map();
        
        for (const txn of transactions) {
            const dateKey = txn.date.toDateString();
            
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, txn);
            } else {
                dateMap.set(dateKey, txn);
            }
        }
        
        const uniqueTransactions = Array.from(dateMap.values())
            .map(t => ({ date: t.date, closingBalance: t.closingBalance }))
            .sort((a, b) => a.date - b.date);
        
        console.log(`✅ After grouping by date: ${uniqueTransactions.length} unique dates`);
        
        if (uniqueTransactions.length === 0) {
            console.log('❌ No transactions found!');
            console.log('📋 Showing first 50 lines of PDF for debugging:');
            lines.slice(0, 50).forEach((line, i) => {
                if (line.trim()) console.log(`${i}: ${line}`);
            });
            throw new Error('No transactions found in the PDF. Please check if the PDF format is correct.');
        }
        
        return {
            fromDate,
            toDate,
            transactions: uniqueTransactions
        };
    } catch (error) {
        console.error('❌ Parse error:', error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}

/**
 * Calculate AMB and required balance for remaining days
 */
function calculateAMB(statementData, targetAMB = 5000) {
    const { fromDate, toDate, transactions } = statementData;
    
    if (transactions.length === 0) {
        throw new Error('No transactions found in statement');
    }
    
    const month = fromDate.getMonth();
    const year = fromDate.getFullYear();
    
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    const currentDate = today > toDate ? toDate : today;
    
    const daysElapsed = currentDate.getDate();
    
    let sumOfDailyBalances = 0;
    let dayBalanceMap = new Map();
    
    transactions.forEach(txn => {
        const dayOfMonth = txn.date.getDate();
        dayBalanceMap.set(dayOfMonth, txn.closingBalance);
    });
    
    let lastKnownBalance = transactions[0].closingBalance;
    
    for (let day = 1; day <= daysElapsed; day++) {
        const balance = dayBalanceMap.get(day) || lastKnownBalance;
        sumOfDailyBalances += balance;
        
        if (dayBalanceMap.has(day)) {
            lastKnownBalance = balance;
        }
    }
    
    const currentAMB = sumOfDailyBalances / daysElapsed;
    const requiredTotalSum = targetAMB * totalDaysInMonth;
    const remainingSumNeeded = requiredTotalSum - sumOfDailyBalances;
    const remainingDays = totalDaysInMonth - daysElapsed;
    const requiredBalanceForRemainingDays = remainingDays > 0 
        ? remainingSumNeeded / remainingDays 
        : 0;
    
    const currentBalance = lastKnownBalance;
    
    // Calculate surplus or deficit
    // If remainingSumNeeded <= 0, you've already exceeded the target
    // surplus = the amount already accumulated above requirement
    // If remainingSumNeeded > 0, you still need to accumulate more
    // deficit = how much more you need compared to current balance
    let surplus = 0;
    let deficit = 0;
    
    if (remainingSumNeeded <= 0) {
        // Already exceeded target - calculate surplus
        surplus = Math.abs(remainingSumNeeded);
    } else {
        // Still need to accumulate - calculate deficit
        deficit = Math.max(0, requiredBalanceForRemainingDays - currentBalance);
    }
    
    return {
        month: fromDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        statementPeriod: `${fromDate.toLocaleDateString('en-IN')} to ${toDate.toLocaleDateString('en-IN')}`,
        totalDaysInMonth,
        daysElapsed,
        remainingDays,
        currentBalance,
        currentAMB: Math.round(currentAMB * 100) / 100,
        targetAMB,
        sumOfDailyBalances: Math.round(sumOfDailyBalances * 100) / 100,
        requiredTotalSum: Math.round(requiredTotalSum * 100) / 100,
        remainingSumNeeded: Math.round(remainingSumNeeded * 100) / 100,
        requiredBalanceForRemainingDays: Math.round(requiredBalanceForRemainingDays * 100) / 100,
        surplus: Math.round(surplus * 100) / 100,
        deficit: Math.round(deficit * 100) / 100,
        status: currentAMB >= targetAMB ? 'ON_TRACK' : 'BELOW_TARGET',
        transactions: transactions.map(t => ({
            date: t.date.toLocaleDateString('en-IN'),
            closingBalance: t.closingBalance
        }))
    };
}

// API endpoint for PDF upload and analysis
app.post('/api/analyze', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const targetAMB = parseInt(req.body.targetAMB) || 5000;
        
        // Parse the PDF
        const statementData = await parseBankStatement(req.file.path);
        
        // Calculate AMB
        const results = calculateAMB(statementData, targetAMB);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true, data: results });
    } catch (error) {
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error('Error analyzing PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        service: 'AMB Tracker',
        timestamp: new Date().toISOString() 
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

app.listen(PORT, () => {
    console.log(`\n🚀 AMB Tracker Server is running!`);
    console.log(`📊 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`\n💡 Upload your HDFC bank statement PDF to track your AMB\n`);
});
