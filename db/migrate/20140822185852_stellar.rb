class Stellar < ActiveRecord::Migration
  def change
    create_table :stellar_wallets do |t|
      t.integer :user_id
      t.string :account_id
      t.string :master_seed
      t.string :master_seed_hex
      t.string :public_key
      t.string :public_key_hex
    end
    add_index :stellar_wallets, :user_id, :unique => true
  end
end
