# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Rails.application.initialize!

NativeDbTypesOverride.configure({
  postgres: {
    datetime: { name: "timestamptz" },
    timestamp: { name: "timestamptz" }
  }
})
