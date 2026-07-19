from apps.stores.choices import StorePlan

# Mirrors the plan prices shown in the merchant dashboard (frontend BillingPage).
# XOF, per month.
PLAN_PRICES = {
    StorePlan.FREE: 0,
    StorePlan.STARTER: 9000,
    StorePlan.PRO: 25000,
}
