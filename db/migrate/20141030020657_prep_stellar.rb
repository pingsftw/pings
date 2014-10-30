class PrepStellar < ActiveRecord::Migration
  def change
    add_column :stellar_wallets, :prepped, :boolean
  end
end
