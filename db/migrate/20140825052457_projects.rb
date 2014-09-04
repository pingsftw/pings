class Projects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name
      t.timestamps
    end
    add_column :stellar_wallets, :project_id, :integer
  end
end
