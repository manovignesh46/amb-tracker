const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
require('dotenv').config();

// AMB Tracker for HDFC Bank Savings Account
// Calculates Average Monthly Balance and required balance for remaining days

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
        
        // Extract transactions
        // HDFC format can span multiple lines:
        // Line 1: DD/MM/YY Narration...
        // Line 2: ...continuation Ref.No DD/MM/YY Withdrawal Deposit ClosingBalance
        
        const transactions = [];
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Stop at summary
            if (line.includes('STATEMENT SUMMARY')) {
                break;
            }
            
            // Skip headers and empty lines
            if (!line || line.includes('Narration') || line.includes('Closing Balance') || line.includes('Statement of account')) {
                continue;
            }
            
            // Check if line starts with a date (DD/MM/YY or DD/MM/YYYY)
            const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{2,4})\s+/);
            
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const date = parseDate(dateStr);
                
                // Collect all numbers from this line and the next few lines
                // until we find the closing balance pattern
                let combinedText = line;
                
                // Look ahead for continuation lines (max 5 lines)
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    
                    // Stop if we hit another date or summary
                    if (nextLine.match(/^\d{2}\/\d{2}\/\d{2,4}\s+/) || nextLine.includes('STATEMENT SUMMARY')) {
                        break;
                    }
                    
                    combinedText += ' ' + nextLine;
                    
                    // If this line has the value date and amounts pattern, it's the data line
                    // Pattern: XXXXXXXXXX DD/MM/YY Amount Amount Amount
                    if (nextLine.match(/\d{10,}\s+\d{2}\/\d{2}\/\d{2,4}\s+[\d,\.]+/)) {
                        break;
                    }
                }
                
                // Extract only properly formatted amounts (with optional commas and .00)
                // This avoids matching parts of reference numbers
                const allNumbers = combinedText.match(/(?<!\d)\d{1,3}(?:,\d{3})*\.\d{2}(?!\d)/g);
                
                if (allNumbers && allNumbers.length > 0) {
                    // The last number should be the closing balance
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
        // This represents the final balance after all transactions that day
        const dateMap = new Map();
        
        for (const txn of transactions) {
            const dateKey = txn.date.toDateString();
            
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, txn);
            } else {
                // Always keep the latest transaction (last one wins)
                // Since we process in order, the last one is the end-of-day balance
                dateMap.set(dateKey, txn);
            }
        }
        
        // Convert to array and sort
        const uniqueTransactions = Array.from(dateMap.values())
            .map(t => ({ date: t.date, closingBalance: t.closingBalance }))
            .sort((a, b) => a.date - b.date);
        
        console.log('\n✅ Parsed transactions:');
        for (const txn of uniqueTransactions) {
            console.log(`  ${txn.date.toLocaleDateString('en-IN')}: ₹${txn.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
        console.log('');
        
        if (uniqueTransactions.length === 0) {
            throw new Error('No transactions found in the PDF. Please check if the PDF format is correct.');
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
 * Calculate AMB and required balance for remaining days
 */
function calculateAMB(statementData, targetAMB = 5000) {
    const { fromDate, toDate, transactions } = statementData;
    
    if (transactions.length === 0) {
        throw new Error('No transactions found in statement');
    }
    
    // Get the month and year from the statement
    const month = fromDate.getMonth();
    const year = fromDate.getFullYear();
    
    // Calculate total days in the month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get today's date (or use the last transaction date if statement is from past)
    const today = new Date();
    const currentDate = today > toDate ? toDate : today;
    
    // Calculate number of days elapsed
    const daysElapsed = currentDate.getDate();
    
    // Calculate sum of daily balances for elapsed days
    let sumOfDailyBalances = 0;
    let dayBalanceMap = new Map();
    
    // Create a map of date -> closing balance
    transactions.forEach(txn => {
        const dayOfMonth = txn.date.getDate();
        dayBalanceMap.set(dayOfMonth, txn.closingBalance);
    });
    
    // For each day from 1 to daysElapsed, use the closing balance
    let lastKnownBalance = transactions[0].closingBalance;
    
    for (let day = 1; day <= daysElapsed; day++) {
        const balance = dayBalanceMap.get(day) || lastKnownBalance;
        sumOfDailyBalances += balance;
        
        // Update last known balance
        if (dayBalanceMap.has(day)) {
            lastKnownBalance = balance;
        }
    }
    
    // Calculate current AMB
    const currentAMB = sumOfDailyBalances / daysElapsed;
    
    // Calculate required total sum for target AMB
    const requiredTotalSum = targetAMB * totalDaysInMonth;
    
    // Calculate remaining sum needed
    const remainingSumNeeded = requiredTotalSum - sumOfDailyBalances;
    
    // Calculate remaining days
    const remainingDays = totalDaysInMonth - daysElapsed;
    
    // Calculate required average balance for remaining days
    const requiredBalanceForRemainingDays = remainingDays > 0 
        ? remainingSumNeeded / remainingDays 
        : 0;
    
    // Get current balance (last transaction)
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
        status: currentAMB >= targetAMB ? 'ON_TRACK' : 'BELOW_TARGET'
    };
}

/**
 * Display results in a user-friendly format
 */
function displayResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('         HDFC BANK - AMB TRACKER RESULTS');
    console.log('='.repeat(60));
    console.log(`\n📅 Statement Period: ${results.month}`);
    console.log(`📊 Total Days in Month: ${results.totalDaysInMonth}`);
    console.log(`✅ Days Elapsed: ${results.daysElapsed}`);
    console.log(`⏳ Remaining Days: ${results.remainingDays}`);
    
    console.log('\n' + '-'.repeat(60));
    console.log('CURRENT STATUS:');
    console.log('-'.repeat(60));
    console.log(`💰 Current Balance: ₹${results.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`📈 Current AMB: ₹${results.currentAMB.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`🎯 Target AMB: ₹${results.targetAMB.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    
    console.log('\n' + '-'.repeat(60));
    console.log('CALCULATIONS:');
    console.log('-'.repeat(60));
    console.log(`Sum of Daily Balances (Elapsed): ₹${results.sumOfDailyBalances.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`Required Total Sum for Target AMB: ₹${results.requiredTotalSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`Remaining Sum Needed: ₹${results.remainingSumNeeded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    
    console.log('\n' + '-'.repeat(60));
    console.log('REQUIRED ACTION:');
    console.log('-'.repeat(60));
    
    if (results.remainingDays > 0) {
        if (results.status === 'ON_TRACK' && results.surplus > 0) {
            console.log(`\n✅ EXCELLENT: You have a surplus of ₹${results.surplus.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            console.log(`   You've already accumulated ₹${results.surplus.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MORE than needed for target AMB!`);
            console.log(`   You can maintain ₹0 balance for remaining ${results.remainingDays} days and still meet your target.`);
        } else if (results.requiredBalanceForRemainingDays <= 0) {
            console.log(`\n✅ PERFECT: Target already achieved!`);
            console.log(`   You can maintain ₹0 balance for remaining ${results.remainingDays} days and still meet your target.`);
        } else {
            console.log(`📌 Required Average Balance for Remaining ${results.remainingDays} Days: ₹${results.requiredBalanceForRemainingDays.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            
            if (results.deficit > 0) {
                console.log(`\n⚠️  WARNING: You need to ADD ₹${results.deficit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to your account!`);
                console.log(`   Maintain at least ₹${results.requiredBalanceForRemainingDays.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for the next ${results.remainingDays} days.`);
            } else {
                console.log(`\n✅ GOOD NEWS: Your current balance is sufficient!`);
                console.log(`   Maintain at least ₹${results.requiredBalanceForRemainingDays.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for remaining days.`);
            }
        }
    } else {
        console.log(`\n✅ Month completed! Final AMB: ₹${results.currentAMB.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        if (results.currentAMB >= results.targetAMB) {
            console.log(`   🎉 You successfully maintained the minimum AMB!`);
        } else {
            console.log(`   ❌ You did not maintain the minimum AMB. Penalty may apply.`);
        }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main function
 */
async function main() {
    try {
        // Get PDF file path from command line arguments or .env file
        const args = process.argv.slice(2);
        
        // Try to get path from args first, then from .env
        let pdfPath;
        if (args.length > 0) {
            pdfPath = path.resolve(args[0]);
        } else if (process.env.ACCOUNT_STATEMENT_PDF_PATH) {
            pdfPath = path.resolve(process.env.ACCOUNT_STATEMENT_PDF_PATH);
            console.log(`\n📁 Using PDF path from .env file`);
        } else {
            console.log('\n❌ Error: Please provide the path to your bank statement PDF file.');
            console.log('\nUsage:');
            console.log('  node index.js <path-to-statement.pdf> [target-AMB]');
            console.log('\nOr set ACCOUNT_STATEMENT_PDF_PATH in .env file');
            console.log('\nExample:');
            console.log('  node index.js ./statement.pdf');
            console.log('  node index.js ./statement.pdf 5000');
            console.log('\n');
            process.exit(1);
        }
        
        const targetAMB = args[1] || args[0] ? parseFloat(args[1]) || 5000 : 5000;
        
        // Check if file exists
        if (!fs.existsSync(pdfPath)) {
            console.log(`\n❌ Error: File not found: ${pdfPath}\n`);
            process.exit(1);
        }
        
        console.log('\n🔍 Parsing bank statement...');
        const statementData = await parseBankStatement(pdfPath);
        console.log("statementData->", statementData)
        
        console.log('📊 Calculating AMB...');
        const results = calculateAMB(statementData, targetAMB);
        
        displayResults(results);
        
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

// Run the main function
// main();

