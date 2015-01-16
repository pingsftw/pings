# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150115231452) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "acceptances", force: true do |t|
    t.integer "project_id"
    t.string  "currency"
    t.integer "limit"
  end

  create_table "cards", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "card_uid"
    t.integer  "user_id"
    t.string   "brand"
    t.string   "last4"
  end

  create_table "cashouts", force: true do |t|
    t.integer "project_id"
    t.integer "value"
    t.string  "redeem_hash"
    t.string  "stripe_id"
  end

  create_table "charges", force: true do |t|
    t.string   "card_uid"
    t.integer  "card_id"
    t.integer  "amount"
    t.string   "customer"
    t.string   "charge_uid"
    t.string   "balance_transaction"
    t.boolean  "paid"
    t.string   "issue_hash"
    t.string   "bid_hash"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "gifts", force: true do |t|
    t.integer  "giver_id"
    t.integer  "receiver_id"
    t.string   "transaction_hash"
    t.string   "receiver_email"
    t.integer  "value"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "payment_addresses", force: true do |t|
    t.integer "user_id"
    t.string  "secret"
    t.string  "address"
  end

  create_table "payments", force: true do |t|
    t.integer  "payment_address_id"
    t.string   "address"
    t.integer  "value"
    t.string   "destination_address"
    t.string   "input_address"
    t.string   "input_transaction_hash"
    t.string   "transaction_hash"
    t.datetime "created_at"
    t.string   "issue_hash"
    t.string   "bid_hash"
  end

  create_table "price_levels", force: true do |t|
    t.string  "currency"
    t.integer "price"
    t.integer "target"
    t.integer "filled",   default: 0
    t.boolean "complete", default: false
  end

  create_table "projects", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "autobid",           default: true
    t.string   "url"
    t.string   "logo_url"
    t.text     "long_description"
    t.string   "short_description"
  end

  create_table "stellar_wallets", force: true do |t|
    t.integer "user_id"
    t.string  "account_id"
    t.string  "master_seed"
    t.string  "master_seed_hex"
    t.string  "public_key"
    t.string  "public_key_hex"
    t.integer "project_id"
    t.boolean "prepped"
    t.integer "supported_project_id"
  end

  add_index "stellar_wallets", ["user_id"], name: "index_stellar_wallets_on_user_id", unique: true, using: :btree

  create_table "stripe_recipients", force: true do |t|
    t.string   "stripe_id"
    t.boolean  "livemode"
    t.datetime "created"
    t.string   "stripe_type"
    t.json     "active_account"
    t.string   "description"
    t.string   "email"
    t.json     "metadata"
    t.string   "name"
    t.json     "cards"
    t.boolean  "has_more"
    t.boolean  "verified"
    t.string   "url"
    t.integer  "total_count"
    t.string   "default_card"
    t.integer  "project_id"
    t.string   "object"
  end

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.string   "username"
    t.boolean  "approved"
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["username"], name: "index_users_on_username", unique: true, using: :btree

end
