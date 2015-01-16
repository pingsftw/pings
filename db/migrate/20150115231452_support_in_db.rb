class SupportInDb < ActiveRecord::Migration
  def change
    add_column :stellar_wallets, :supported_project_id, :integer
  end
end
