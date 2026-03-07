

## Problem

1. **Hardcoded `€` and `$` symbols** across multiple files instead of using the user's actual currency symbol:
   - `AdminSubscriptions.tsx` — table shows `$` for prices
   - `ParentSubscription.tsx` — shows `€` for current plan price
   - `PaymentSimulator.tsx` — shows `€` in plan selection, payment button, and confirmation
   - `PartnerReports.tsx` — shows `€` for investment per child

2. **Missing currencies in `supported_currencies` table**: MZN, CVE, STN, XOF, ZAR are in `countries-currencies.ts` but not in the database table.

3. **No price conversion logic**: When a user changes country, the subscription prices should display in their local currency with appropriate conversion.

---

## Plan

### 1. Add missing currencies to `supported_currencies` table

Insert MZN (MT), CVE ($), STN (Db), XOF (CFA), ZAR (R) into the `supported_currencies` table using the insert tool.

### 2. Create a currency conversion reference

Add a database migration to create a `currency_exchange_rates` table with columns: `from_currency`, `to_currency`, `rate`, `updated_at`. Seed it with approximate rates from AOA (base) to all supported currencies. This allows displaying plan prices in the user's local currency.

### 3. Update `AdminSubscriptions.tsx`

Replace the hardcoded `$` in the table cells with the tier's own `currency` value. Look up the symbol from `COUNTRY_CURRENCIES` or display the currency code. The admin table should show the currency defined on each tier.

### 4. Update `PaymentSimulator.tsx`

- Accept the user's currency symbol as a prop or use the `useTenantCurrency` hook
- Replace all hardcoded `€` with the resolved currency symbol
- Apply conversion rate to displayed prices based on user's currency vs tier's base currency

### 5. Update `ParentSubscription.tsx`

- Use `useTenantCurrency` to get the user's currency symbol
- Replace `€${currentTier.priceMonthly}` with the correct symbol and converted price

### 6. Update `PartnerReports.tsx`

- Replace `€${avgSavingsPerChild}` with the partner's currency symbol via `useTenantCurrency`

### 7. Add a utility helper

Create a `formatPrice(amount, currencySymbol)` helper or extend `CurrencyDisplay` to handle subscription pricing, so all price formatting is consistent and centralized.

---

### Technical details

- The `currency_exchange_rates` table stores static rates (admin-editable later). Schema:
  ```sql
  CREATE TABLE currency_exchange_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency text NOT NULL DEFAULT 'AOA',
    target_currency text NOT NULL,
    rate numeric NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(base_currency, target_currency)
  );
  ```
- RLS: public SELECT, admin-only write.
- A helper function `convertPrice(amount, fromCurrency, toCurrency, rates)` will handle conversion client-side.
- The `PaymentSimulator` and `ParentSubscription` will use `useTenantCurrency` to resolve the symbol and apply conversion before display.

