const { PDFParse } = require('pdf-parse');
const formidable = require('formidable');
const fs = require('fs');

/**
 * Parse date from DD/MM/YYYY or DD/MM/YY format
 */
function parseDate(dateStr) {
    const parts = dateStr.split('/');
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
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        let text = data.text;
        
        // Extract statement period (From and To dates)
        const periodMatch = text.match(/From\s*:\s*(\d{2}\/\d{2}\/\d{4}).*?To\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
        
        if (!periodMatch) {
            throw new Error('Could not find statement period in PDF');
        }
        
        const fromDate = parseDate(periodMatch[1]);
        const toDate = parseDate(periodMatch[2]);
        
        const transactions = [];
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('STATEMENT SUMMARY')) {
                break;
            }
            
            if (!line || line.includes('Narration') || line.includes('Closing Balance') || line.includes('Statement of account')) {
                continue;
            }
            
            // Check if line starts with a date (DD/MM/YY or DD/MM/YYYY)
            const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{2,4})\s+/);
            
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const date = parseDate(dateStr);
                
                // Collect all numbers from this line and the next few lines
                let combinedText = line;
                
                // Look ahead for continuation lines (max 5 lines)
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    
                    // Stop if we hit another date or summary
                    if (nextLine.match(/^\d{2}\/\d{2}\/\d{2,4}\s+/) || nextLine.includes('STATEMENT SUMMARY')) {
                        break;
                    }
                    
                    combinedText += ' ' + nextLine;
                    
                    if (nextLine.match(/\d{10,}\s+\d{2}\/\d{2}\/\d{2,4}\s+[\d,\.]+/)) {
                        break;
                    }
                }
                
                // Extract only properly formatted amounts (with optional commas and .00)
                const allNumbers = combinedText.match(/(?<!\d)\d{1,3}(?:,\d{3})*\.\d{2}(?!\d)/g);
                
                if (allNumbers && allNumbers.length > 0) {
                    const closingBalanceStr = allNumbers[allNumbers.length - 1];
                    const closingBalance = parseFloat(closingBalanceStr.replace(/,/g, ''));
                    
                    if (!isNaN(closingBalance) && closingBalance >= 0) {
                        transactions.push({
                            date: date,
                            closingBalance: closingBalance
                        });
                    }
                }
            }
        }
        
        // Group by date - keep the LAST closing balance per date (end of day)
        const dateMap = new Map();
        
        for (const txn of transactions) {
            const dateKey = txn.date.toDateString();
            dateMap.set(dateKey, txn);
        }
        
        const uniqueTransactions = Array.from(dateMap.values())
            .map(t => ({ date: t.date, closingBalance: t.closingBalance }))
            .sort((a, b) => a.date - b.date);
        
        if (uniqueTransactions.length === 0) {
            throw new Error('No transactions found in the PDF');
        }
        
        return {
            fromDate,
            toDate,
            transactions: uniqueTransactions
        };
    } catch (error) {
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}

/**
 * Calculate AMB and generate results
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
    
    let surplus = 0;
    let deficit = 0;
    
    if (remainingSumNeeded <= 0) {
        surplus = Math.abs(remainingSumNeeded);
    } else {
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

/**
 * Vercel Serverless Function Handler
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
        
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });
        
        const pdfFile = files.pdf?.[0] || files.pdf;
        if (!pdfFile) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        
        const targetAMB = parseInt(fields.targetAMB?.[0] || fields.targetAMB) || 5000;
        
        // Parse the PDF
        const statementData = await parseBankStatement(pdfFile.filepath);
        
        // Calculate AMB
        const results = calculateAMB(statementData, targetAMB);
        
        // Clean up uploaded file
        try {
            fs.unlinkSync(pdfFile.filepath);
        } catch (e) {
            // Ignore cleanup errors
        }
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Error analyzing PDF:', error);
        res.status(500).json({ error: error.message });
    }
};
