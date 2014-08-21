class EmailBtc < ActiveRecord::Migration
  def change
    add_column :users, :funding_address, :string
    create_table :payments do |t|
      t.string :address
      t.integer :user_id
      t.decimal :quantity
      t.datetime :created_at
    end
  end
end
