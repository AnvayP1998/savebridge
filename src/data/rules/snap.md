# SNAP Program Rules Reference
*Condensed from USDA FNS regulations (7 CFR Part 273) for AI-assisted error detection.*

---

## 1. Eligibility Overview

SNAP eligibility is determined at the **household** level. A household is defined as individuals who live together and customarily purchase and prepare meals together.

**Gross Income Test:** Household gross monthly income must be at or below **130% of the Federal Poverty Level (FPL)**.

**Net Income Test:** Household net monthly income (gross income minus allowable deductions) must be at or below **100% of FPL**.

**Asset Test:** Most households must have assets of $2,750 or less ($4,250 if a household member is age 60+ or has a disability).

**2024-2025 Monthly Income Limits (48 states + DC):**

| Household Size | Gross Limit (130% FPL) | Net Limit (100% FPL) |
|---|---|---|
| 1 | $1,580 | $1,215 |
| 2 | $2,137 | $1,644 |
| 3 | $2,694 | $2,072 |
| 4 | $3,250 | $2,500 |
| 5 | $3,807 | $2,929 |
| 6 | $4,364 | $3,357 |

---

## 2. Allowable Deductions

Deductions reduce gross income to arrive at net income, which determines both eligibility and benefit amount. Caseworkers must ask about ALL applicable deductions.

### 2a. Earned Income Deduction
- **Rate:** 20% of gross earned income is deducted automatically
- **Applies to:** All households with wage/salary income
- **Common error:** Not applying to all earning members; misclassifying self-employment income
- *Cite: 7 CFR 273.9(b)*

### 2b. Standard Deduction
- **Amount:** $193/month (FY2024-2025, households 1-3); $193 (4-person); $226 (5-person); $258 (6+ person)
- **Applies to:** All eligible households automatically
- *Cite: 7 CFR 273.9(d)(1)*

### 2c. Dependent Care Deduction
- **Amount:** Actual cost of dependent care paid so a household member can work, seek work, or attend training/school
- **Qualifying dependents:** Children under 18 AND any household member unable to care for themselves
- **CRITICAL - Common error:** Households with working parents and young children frequently fail to report childcare costs. If a household has a working parent AND children under 13, ALWAYS ask about childcare expenses. If childcareCost is $0 and children are under school age (under 5), this is almost certainly an error.
- **Detection rule:** childcareCost == 0 AND children.some(c => c.age < 13) AND monthlyIncome > 0 = FLAG as missing dependent care deduction
- **Estimated impact:** A $280/month childcare deduction on a $2,100 income household increases SNAP benefit by approximately $84/month
- *Cite: 7 CFR 273.9(d)(4)*

### 2d. Medical Expense Deduction (Elderly/Disabled Only)
- **Applies to:** Household members age 60+ OR receiving SSI/SSDI/VA disability
- **Amount:** Allowable medical expenses exceeding $35/month (the $35 floor is excluded)
- **Qualifying expenses:** Doctor visits, prescriptions, dental, vision, health insurance premiums, medical transportation, OTC drugs prescribed by doctor
- **Common error:** Frequently under-reported for elderly households. If member is 60+ and reports ANY medical expenses, verify the full monthly amount.
- *Cite: 7 CFR 273.9(d)(3)*

### 2e. Excess Shelter Deduction
- **Calculation:** Shelter costs exceeding 50% of net income after all other deductions; capped at $672/month (FY2024-2025) for non-elderly/non-disabled households; NO cap for elderly/disabled
- **Qualifying costs:** Rent, mortgage, property taxes, homeowner's insurance, utilities
- **Utility standard:** DC Standard Utility Allowance (SUA) FY2024: $510/month (heating/cooling), $289 (limited utility), $58 (telephone only). Always compare actual vs. SUA and apply whichever is higher.
- *Cite: 7 CFR 273.9(d)(5)*

### 2f. Child Support Payment Deduction
- **Amount:** Legally obligated child support payments made to non-household members
- *Cite: 7 CFR 273.9(d)(6)*

---

## 3. Benefit Calculation Formula

1. Start with gross monthly income
2. Subtract 20% earned income deduction
3. Subtract standard deduction
4. Subtract dependent care deduction (if applicable)
5. Subtract medical deduction minus $35 (elderly/disabled only)
6. Subtract excess shelter deduction (housing + utilities minus 50% of remaining net income, capped at $672)
7. Net income = result after all deductions
8. SNAP benefit = Maximum allotment for household size minus (net income x 30%)

**Maximum Monthly SNAP Allotments (FY2024-2025):**

| Household Size | Maximum Monthly Allotment |
|---|---|
| 1 | $291 |
| 2 | $535 |
| 3 | $766 |
| 4 | $973 |
| 5 | $1,155 |
| 6 | $1,386 |

**Example - Rosa Rodriguez (household of 3, with childcare correction):**
- Gross income: $2,100; Earned deduction (20%): -$420 = $1,680
- Standard deduction: -$193 = $1,487
- Shelter: $1,400 rent + $180 utilities = $1,580; 50% of $1,487 = $743; excess = $837; capped at $672 = -$672 = net $815
- WITHOUT childcare: SNAP = $766 - ($815 x 0.30) = $766 - $245 = $521
- WITH $280 childcare: net = $815 - $280 = $535; SNAP = $766 - ($535 x 0.30) = $766 - $160 = $606 (increase ~$84/month)

---

## 4. What SNAP Benefits Can Purchase

**Allowed:**
- Any food or food product for home consumption
- Seeds and plants that produce food for the household
- Cold prepared foods (cold deli sandwiches, cold rotisserie chicken, sushi)
- Energy drinks with a Nutrition Facts label

**NOT Allowed:**
- Hot foods prepared and ready to eat at point of sale (hot soup, hot pizza sold by the slice, hot rotisserie chicken at grocery deli counter)
- Alcoholic beverages and tobacco
- Vitamins, supplements, medicines
- Non-food household items (paper goods, cleaning products, pet food)
- Restaurant meals (exception: Restaurant Meals Program for elderly/disabled/homeless - DC does NOT participate)

**Common questions:**
- Cold rotisserie chicken from store: ALLOWED (cold at time of purchase)
- Hot soup from deli counter: NOT ALLOWED
- Starbucks bottled Frappuccino: ALLOWED (sold cold, has Nutrition Facts)
- Fast food restaurant: NOT ALLOWED in DC

---

## 5. Double Up Food Bucks

SNAP matching program that doubles SNAP dollars spent on fruits and vegetables, dollar-for-dollar, up to the store daily maximum.

- Only applies to SNAP purchases of fresh, frozen (no sauce added), or canned (low-sodium, no syrup) fruits and vegetables
- Match is provided as store credit or tokens (varies by location)
- DC participating stores include: Safeway (select), Giant Food (select), Yes! Organic Market, Good Food Markets, Eastern Market, select farmers markets
- Maximum match varies by store ($10-$25 per visit at most DC locations)

---

## 6. Recertification Requirements

- Standard certification periods: 12 months (most households); 24 months (elderly/fixed-income); 6 months (unstable income)
- At recertification: verify all household composition, income, and deduction changes
- Required documents: proof of identity, residency, income, rent/mortgage, utility bills, childcare receipts if claiming deduction
- If a deduction from a prior period is missing from the recertification form: caseworker MUST ask - do not assume the household no longer qualifies

---

## 7. Error Detection Rules (AI Reference)

Rank by confidence when flagging:

1. **Missing dependent care deduction** (HIGH confidence flag): childcareCost == 0 AND household has child(ren) under 13 AND at least one working adult
2. **Missing medical deduction** (HIGH confidence flag): householdMember.age >= 60 AND medicalExpenses == 0
3. **Utility allowance not optimized** (MEDIUM confidence): actual utilities reported when SUA might be higher
4. **Earned income deduction gap** (MEDIUM confidence): self-employment or gig income that may need different treatment
5. **Incorrect household size** (MEDIUM confidence): number of children listed inconsistent with ages or family notes
6. **Categorical eligibility missed** (LOW confidence): household receiving TANF may be categorically eligible without income test
