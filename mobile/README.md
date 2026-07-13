# Checkout Mobile

React Native (TypeScript) mobile app implementing a 7-step credit-card checkout flow:
Splash → Product catalog → Select items → Checkout (Backdrop: card form) → Payment
summary (Backdrop) → Final transaction status → back to catalog.

Talks to the [backend API](../README.md) in this same repository for the product
catalog and to create/track transactions, and tokenizes card data directly against
the card-payment gateway's public sandbox endpoint (see "Design decisions" below).

## Tech stack

- **React Native 0.86** (CLI, not Expo) + TypeScript
- **Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) — Flux-style state, mandatory per spec
- **React Navigation** (native stack) for the screen flow
- **`@react-native-async-storage/async-storage`** + **AES encryption (`crypto-js`)** for
  persisting the last transaction result on-device
- **Jest + `@testing-library/react-native`** for unit/component tests

## Installation

```bash
cd mobile
npm install
```

## Prebuilt APK

A ready-to-install debug APK is included at
[`apk/CheckoutMobile-debug.apk`](apk/CheckoutMobile-debug.apk) (~49 MB, `arm64-v8a`
only — covers virtually all real Android devices from the last several years; it's
built with `-PreactNativeArchitectures=arm64-v8a` to stay well under GitHub's 100 MB
file limit, since an all-ABI debug build is ~150 MB). Install it directly on a
device/emulator:

```bash
adb install mobile/apk/CheckoutMobile-debug.apk
```

It's a debug build (see [Known limitations](#known-limitations)), so it expects
Metro or a reachable backend at the configured `API_BASE_URL` to actually load data —
without a backend it will boot to the Splash screen and show an empty/failed catalog
load, without crashing.

## Configuration

`src/config/env.ts` holds the API base URL and the gateway's **public** key (safe to
ship client-side — see "Design decisions"). By default `API_BASE_URL` points to
`http://10.0.2.2:3000`, which is the special alias the Android emulator uses to reach
`localhost` on the host machine — i.e. the backend from this same repo running via
`npm run start:dev`. Change it if you're running on a physical device (use your
machine's LAN IP) or a deployed backend.

`PAYMENT_API_URL` / `PAYMENT_PUBLIC_KEY` ship as placeholders (empty/generic) in this
repository on purpose — fill them in locally with your own sandbox values to test
real card tokenization (`tokenizeCard.ts`); do not commit real credentials to a
public repo.

## Running locally

```bash
# 1. Start the backend first (from the repo root)
cd .. && npm run start:dev

# 2. Start Metro and run on Android (from mobile/)
cd mobile
npm run android
```

## Tests & coverage

```bash
npm test              # unit tests
npm test -- --coverage
```

**Latest results: 80 tests passing, 20 suites.**

| Metric | Coverage |
|---|---|
| Statements | 96.56% |
| Branches | 88.63% |
| Functions | 94.50% |
| Lines | 96.32% |

Threshold enforced in `jest.config.js` (80% on all four metrics).

Covered: card validation (Luhn, brand detection, expiry/CVC), currency formatting,
encryption round-trip, all Redux slices (including async thunks against a mocked
`fetch`), the client-side tokenization service, the encrypted-persistence middleware,
every component (`Backdrop`, `ProductCard`, `CreditCardForm`, `Toast`,
`ErrorBoundary`, `CardBrandBadge`), all four screens (including the happy and
unhappy checkout paths), and a root-navigator smoke test.

## Architecture

```
src/
├── app/            # Redux store, typed hooks, encrypted-transaction persistence
├── config/         # env constants (API base URL, gateway public key)
├── features/       # Redux slices — one per domain concern
│   ├── products/    # catalog (fetch thunk)
│   ├── cart/        # client-only cart state + selectors
│   ├── transaction/ # checkout thunk + persisted "current transaction"
│   └── paymentGateway/ # client-side card tokenization against the gateway
├── components/     # Backdrop, ProductCard, CreditCardForm, CardBrandBadge, Toast, ErrorBoundary
├── screens/        # Splash, HomeProducts, Checkout, FinalStatus
└── navigation/      # React Navigation stack + route param types
```

Screens 4–6 of the spec (Checkout / Credit card info / Payment summary) are
implemented as a single `CheckoutScreen` using two `Backdrop` overlays in sequence
(card form, then payment summary) rather than separate navigator routes — this
matches the spec's own wording ("opens a Backdrop") more literally than a full
screen transition would.

## Design decisions

- **No literal provider name in code**, mirroring the [backend](../README.md#design-decisions):
  `src/config/env.ts` only exposes generic `PAYMENT_API_URL` / `PAYMENT_PUBLIC_KEY`
  constants.
- **Card tokenization happens on-device, directly against the gateway**, using only
  the **public** key (`tokenizeCard.ts`). The raw PAN/CVC/expiry never touch our own
  backend — only the resulting token does, in `POST /transactions`. This keeps PCI
  scope on the gateway's own tokenization endpoint and matches the backend's stated
  design decision.
- **Encrypted persistence, not plaintext.** The last transaction result is
  AES-encrypted (`crypto-js`) before being written to `AsyncStorage`
  (`src/app/persistence.ts`), wired via a small Redux middleware
  (`persistTransactionMiddleware` in `src/app/store.ts`) that fires only on
  `createTransaction.fulfilled`. The encryption key is a static on-device constant —
  documented as a simplification appropriate for this exercise; a production app
  would derive/store it via the OS keychain (Keystore/Keychain) instead of a
  hardcoded string.
- **Client-side validation before any network call.** Luhn checksum, VISA/Mastercard
  BIN-range brand detection, expiry (rejects past dates), CVC length, and email
  format are all validated in `CreditCardForm` before `tokenizeCard` is even called —
  this is the "unhappy path: incomplete data" case from the spec, surfaced as inline
  field errors rather than a toast.
- **Toast is reserved for request-level failures** (tokenization failing, the
  network being unreachable, the backend returning a non-2xx) — genuine transaction
  outcomes (`APPROVED`/`DECLINED`/`ERROR`), even unhappy ones, still navigate to the
  **Final transaction status** screen, per the spec's step 7 ("show the result of
  the transaction made"), rather than being swallowed as a toast.
- **Crash resilience.** A top-level `ErrorBoundary` (class component) wraps the
  entire app and renders a recoverable fallback instead of a red screen/crash if any
  screen throws during render, addressing the spec's "crashes are not allowed"
  requirement.
- **No separate "Select Product" screen.** Quantity selection (1..N items) is a
  stepper directly on each `ProductCard` in the Home screen, with a persistent
  bottom cart bar — functionally equivalent to a dedicated selection step without
  an extra navigation hop.

## Known limitations

- **Encryption key is static, not derived from OS-level secure storage.** Acceptable
  for this exercise (see above); flagged as the first thing to change before any
  real deployment.
- **No offline queueing.** If the device has no connectivity when paying, the
  request simply fails and surfaces a toast — there is no retry/outbox queue.
- **APK is a debug build**, signed with the default Android debug keystore (not a
  release/production signing key), suitable for sideloading and manual testing only.
