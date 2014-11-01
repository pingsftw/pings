TOKEN_NAME = "Sunbeams"
Stripe.api_key = ENV["stripe_secret_key"]

StellarConfig = {
  host: ENV["stellar_host"],
  hot_wallet_secret: ENV["hot_wallet_secret"],
  hot_wallet: ENV["hot_wallet"],
  gateway: ENV["gateway_wallet"],
  default_inflation_account: ENV["default_inflation_wallet"]
}
STRIPE_PUBLISHABLE_KEY = ENV["stripe_publishable_key"]
