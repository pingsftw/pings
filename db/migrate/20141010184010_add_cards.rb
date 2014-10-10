class AddCards < ActiveRecord::Migration
  def change
    create_table :cards do |t|
      t.timestamps
      t.string :token
      t.integer :user_id
    end
  end
end
