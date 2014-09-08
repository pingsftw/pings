class AddHashesToPayments < ActiveRecord::Migration
  def change
    add_column :payments, :issue_hash, :string
    add_column :payments, :bid_hash, :string
  end
end
