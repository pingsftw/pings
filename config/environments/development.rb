ENV["stellar_host"] = "s1.ripple.com:51234"
ENV["hot_wallet"] = "rBnVgcoAhQ7SGuFivmern4jzUFZvusm7CU"
ENV["hot_wallet_secret"] = "shKppdiaTSF9PnMSqNMMdKVTV8kpT"
ENV["gateway_wallet"] = "gCmk3eZhFdBGyVf2epUEYhkD91s2JatGz"
ENV["stripe_publishable_key"] = 'pk_test_k1B3ERuI0ElXdq1U6KjgNBUh'
ENV["stripe_secret_key"] = "sk_test_mH78kESY1UJUALYxszlDOAKz"
ENV["admin_email"] = "admin@example.com"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.default_url_options = { :host => "localhost:3000" }

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true
end
