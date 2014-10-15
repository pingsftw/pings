class AddGifts < ActiveRecord::Migration
  def change
    create_table :gifts do |t|
      t.integer :giver_id
      t.integer :receiver_id
      t.string :transaction_hash
      t.string :receiver_email
      t.integer :value
      t.timestamps
    end
  end
end
