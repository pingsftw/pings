class AddCards < ActiveRecord::Migration
  def change
    create_table :cards do |t|
      t.timestamps
      t.string :card_uid
      t.integer :user_id
      t.string :brand
      t.string :last4
    end

    create_table :charges do |t|
      t.string :card_uid
      t.integer :card_id
      t.integer :amount
      t.string :customer
      t.string :charge_uid
      t.string :balance_transaction
      t.boolean :paid
      t.string :issue_hash
      t.string :bid_hash
      t.timestamps
    end
  end
end
