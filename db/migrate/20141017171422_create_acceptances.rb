class CreateAcceptances < ActiveRecord::Migration
  def change
    create_table :acceptances do |t|
      t.integer :project_id
      t.string :currency
      t.integer :limit
    end
  end
end
