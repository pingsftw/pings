class EmailBtc < ActiveRecord::Migration
  def change
    create_table :payment_addresses do |t|
      t.integer :user_id
      t.string :secret
      t.string :address
    end
    create_table :payments do |t|
      t.integer :payment_address_id
      t.string :address
      t.integer :value
      t.string :destination_address
      t.string :input_address
      t.string :input_transaction_hash
      t.string :transaction_hash
      t.datetime :created_at
    end
  end
end
