class EmailBtc < ActiveRecord::Migration
  def change
    add_column :users, :funding_address, :string
    add_column :users, :funding_secret, :string
    create_table :payments do |t|
      t.string :address
      t.integer :user_id
      t.integer :value
      t.string :destination_address
      t.string :input_address
      t.string :input_transaction_hash
      t.string :transaction_hash
      t.datetime :created_at
    end
  end
end
