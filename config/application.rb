require File.expand_path('../boot', __FILE__)

require 'rails/all'


# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

TOKEN_NAME = "Sunbeams"
Stripe.api_key = "sk_test_mH78kESY1UJUALYxszlDOAKz"

StellarConfig = {
  url: 'https://test.stellar.org:9002',
  hot_wallet_secret: "sfvmSPdfVM6FFhSjSxvKVcg6vR95FAWBuczLoecNVH7xVJhBF8f",
  hot_wallet: "gCmk3eZhFdBGyVf2epUEYhkD91s2JatGz",
  gateway: "gCmk3eZhFdBGyVf2epUEYhkD91s2JatGz",
  default_inflation_account: "gG7WkiVMubimEfL2q4VhPmcniLxDCqQqTK"
}
STRIPE_PUBLISHABLE_KEY = 'pk_test_k1B3ERuI0ElXdq1U6KjgNBUh'

module Webs
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de
  end
end
