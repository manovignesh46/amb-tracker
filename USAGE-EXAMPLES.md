# Example: How to use the AMB Tracker

## Scenario
You have an HDFC savings account with ₹5,000 minimum AMB requirement.
It's December 12, 2025, and you want to check if you're on track.

## Steps

1. **Download your statement:**
   - Login to HDFC NetBanking
   - Go to Accounts → Account Statement
   - Select: From 01/12/2025 to 12/12/2025
   - Download as PDF

2. **Run the tool:**
   ```bash
   node index.js ~/Downloads/statement-dec-2025.pdf
   ```

3. **Understand the output:**

   ### If you see:
   ```
   ⚠️ WARNING: You need to ADD ₹2,500.00 to your account!
   Maintain at least ₹7,500.00 for the next 19 days.
   ```
   **Action:** Add ₹2,500 to your account and keep balance at ₹7,500+ for remaining days.

   ### If you see:
   ```
   ✅ GOOD NEWS: You have a surplus of ₹3,421.05
   You can maintain your current balance or even withdraw some amount.
   ```
   **Action:** You're safe! No need to add money.

   ### If you see:
   ```
   ✅ PERFECT: Maintain your current balance of ₹5,000.00 for remaining days.
   ```
   **Action:** Just maintain your current balance.

## Understanding the Math

**Example:**
- Month: December (31 days)
- Target AMB: ₹5,000
- Days elapsed: 12 days
- Current balance: ₹3,000

**Calculation:**
1. Required total sum for month = ₹5,000 × 31 = ₹155,000
2. Let's say sum of daily balances for 12 days = ₹36,000
3. Remaining sum needed = ₹155,000 - ₹36,000 = ₹119,000
4. Remaining days = 31 - 12 = 19 days
5. Required balance for next 19 days = ₹119,000 ÷ 19 = ₹6,263.16

**Result:** You need to maintain ₹6,263.16 for the next 19 days (shortfall = ₹6,263.16 - ₹3,000 = ₹3,263.16)

## Tips

1. **Check mid-month** (around 15th) to know if you need to add funds
2. **Keep buffer** - Maintain slightly more than required to be safe
3. **Track monthly** - Use this tool every month
4. **Download regularly** - Get statements every week if needed
5. **Plan ahead** - If you know you'll withdraw later, maintain higher balance early in the month

## Common Questions

**Q: When should I download the statement?**
A: Anytime during the month when you want to check your progress. Mid-month (15th) is ideal.

**Q: Do I need to include all days?**
A: Yes, download from 1st of the month to current date.

**Q: What if I have multiple transactions per day?**
A: The tool uses closing balance, so it doesn't matter.

**Q: Can I use this for other months?**
A: Yes! Just download the statement for that month and run the tool.

**Q: What if my minimum AMB is different?**
A: Pass it as second argument: `node index.js statement.pdf 10000`
