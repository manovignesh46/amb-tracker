# 🏦 HDFC Bank AMB Tracker

A simple command-line tool to track your **Average Monthly Balance (AMB)** for HDFC Bank savings accounts and calculate how much balance you need to maintain for the remaining days of the month.

## 📋 What is AMB?

Average Monthly Balance (AMB) is the average of your account's end-of-day balances over a month. Banks like HDFC require you to maintain a minimum AMB (e.g., ₹5,000) to avoid penalties.

**Formula:**
```
AMB = (Sum of Daily Closing Balances) / (Total Days in Month)
```

## ✨ Features

- 📄 Parse HDFC bank statement PDFs automatically
- 📊 Calculate current AMB based on elapsed days
- 💰 Calculate required balance for remaining days to meet target AMB
- ⚠️ Alert you if you need to add funds
- ✅ Show surplus if you're ahead of target
- 🎯 Supports custom AMB targets (default: ₹5,000)

## 🚀 Installation

1. **Clone or download this project**

2. **Install dependencies:**
```bash
npm install
```

## 📖 Usage

### Basic Usage (5000 AMB target):
```bash
node index.js path/to/your/statement.pdf
```

### Custom AMB Target:
```bash
node index.js path/to/your/statement.pdf 10000
```

### Example:
```bash
node index.js ~/Downloads/hdfc-statement-dec-2025.pdf
```

## 📥 Getting Your Statement

1. Login to HDFC NetBanking
2. Go to **Accounts** → **Account Statement**
3. Select the current month (e.g., from 1st Dec to today's date)
4. Download as **PDF**
5. Run this tool with the downloaded PDF

## 📊 Sample Output

```
============================================================
         HDFC BANK - AMB TRACKER RESULTS
============================================================

📅 Statement Period: December 2025
📊 Total Days in Month: 31
✅ Days Elapsed: 12
⏳ Remaining Days: 19

------------------------------------------------------------
CURRENT STATUS:
------------------------------------------------------------
💰 Current Balance: ₹30,000.00
📈 Current AMB: ₹18,333.33
🎯 Target AMB: ₹5,000.00

------------------------------------------------------------
CALCULATIONS:
------------------------------------------------------------
Sum of Daily Balances (Elapsed): ₹220,000.00
Required Total Sum for Target AMB: ₹155,000.00
Remaining Sum Needed: -₹65,000.00

------------------------------------------------------------
REQUIRED ACTION:
------------------------------------------------------------
📌 Required Average Balance for Remaining 19 Days: -₹3,421.05

✅ GOOD NEWS: You have a surplus of ₹33,421.05
   You can maintain your current balance or even withdraw some amount.

============================================================
```

## 🎯 How It Works

1. **Parses your PDF** statement to extract:
   - Statement period (from date and to date)
   - Daily transactions with closing balances

2. **Calculates Current AMB:**
   - Sums up all daily closing balances for elapsed days
   - Divides by number of days elapsed

3. **Calculates Required Balance:**
   - Determines total sum needed for target AMB
   - Subtracts sum of balances already accumulated
   - Divides remaining sum by remaining days

4. **Alerts You:**
   - **If shortfall exists:** Tells you how much to add
   - **If surplus exists:** Tells you you're safe
   - **If exact:** Tells you to maintain current balance

## ⚙️ Configuration

You can customize the target AMB by passing it as a second argument:

```bash
# For ₹10,000 minimum AMB requirement
node index.js statement.pdf 10000

# For ₹25,000 minimum AMB requirement
node index.js statement.pdf 25000
```

## 📝 Important Notes

1. **Download mid-month statements** to track your progress
2. **The tool uses closing balances** from your statement
3. **For days without transactions**, it uses the last known balance
4. **Always verify** the calculations with your actual statement
5. This tool is for **tracking purposes only** - always refer to official bank communications

## 🛠️ Troubleshooting

### "File not found" error
- Make sure the PDF path is correct
- Use absolute path or correct relative path
- Example: `~/Downloads/statement.pdf` or `./statement.pdf`

### "Could not parse PDF" error
- Ensure the PDF is a valid HDFC bank statement
- Try downloading the statement again
- Check if PDF is password protected (remove protection first)

### Incorrect calculations
- Verify the statement contains all transactions for the month
- Check if the statement period matches the current month
- Ensure date format in PDF is DD/MM/YYYY or DD/MM/YY

## 🤝 Contributing

Feel free to improve this tool! Some ideas:
- Support for other bank statement formats
- GUI interface
- Email/SMS alerts
- Historical AMB tracking
- Multiple account support

## 📄 License

MIT License - Feel free to use and modify!

## ⚠️ Disclaimer

This tool is for informational purposes only. Always verify calculations with your bank. The developer is not responsible for any financial decisions made based on this tool's output.

---

**Made with ❤️ to help track AMB easily!**
