class AddApprovedUsers < ActiveRecord::Migration
  def change
    add_column :users, :approved, :boolean
  end
end
