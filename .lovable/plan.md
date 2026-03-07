

## Plan: Payment Methods by Country/Currency

### Problem
Currently, the `PaymentSimulator` always shows a credit card form. For Angolan users (country=AO, currency=AOA), the relevant payment methods are **Referência de pagamento** and **Multicaixa Express**. Credit card, PayPal, Stripe, etc. should only appear for other countries/currencies.

### Approach

**Single file change**: `src/components/PaymentSimulator.tsx`

1. **Detect user's country and currency** — the component already uses `useTenantCurrency()` which resolves the currency code. We also need the country, so we'll fetch the profile country via a small query or by extending the hook. Simplest: fetch profile country inline alongside the existing `useTenantCurrency` call.

2. **Define payment method sets**:
   - **Angola (AOA)**: `referencia` (Pagamento por Referência) and `multicaixa_express` (Multicaixa Express)
   - **Other**: `credit_card` (Cartão de Crédito), `paypal` (PayPal), `stripe` (Stripe)

3. **Add payment method selection step** in the `payment` step (between plan summary and form):
   - Show selectable payment method cards with icons
   - Track `selectedPaymentMethod` state

4. **Render different forms per method**:
   - **Cartão de Crédito**: existing card form (name, number, expiry, CVC)
   - **Referência de pagamento**: show generated reference number + entity + amount, with a "Confirmar pagamento" button
   - **Multicaixa Express**: show phone number input field + amount, with a "Pagar" button
   - **PayPal / Stripe**: simplified confirmation with redirect-style button

5. **Validation** adjusts per method — `isFormValid` becomes method-aware.

### Technical Details

- Use `useAuth()` to get user ID, then a small `useQuery` to fetch `profiles.country` (or reuse data from `useTenantCurrency` by extending it to also return `country`). Simplest: add a separate small query in the component.
- Payment method state: `type PaymentMethod = 'referencia' | 'multicaixa_express' | 'credit_card' | 'paypal' | 'stripe'`
- Angola detection: `currencyCode === 'AOA'` (already available in the component)
- For Referência, generate a mock entity (11456) and reference number (random 9 digits) for the simulator
- For Multicaixa Express, collect phone number (9 digits, starting with 9)

### Files Modified
- `src/components/PaymentSimulator.tsx` — main changes (payment method selection + conditional forms)

