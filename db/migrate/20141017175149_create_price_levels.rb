class CreatePriceLevels < ActiveRecord::Migration
  def change
    create_table :price_levels do |t|
      t.string :currency
      t.integer :price
      t.integer :target
      t.integer :filled, default: 0
      t.boolean :complete, default: false
    end
  end
end
