class CreateCashouts < ActiveRecord::Migration
  def change
    create_table :cashouts do |t|
      t.integer :project_id
      t.integer :value
      t.string :redeem_hash
      t.string :stripe_id
    end
  end
end
