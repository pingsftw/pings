class Autobid < ActiveRecord::Migration
  def change
    add_column :projects, :autobid, :boolean, default: true
  end
end
