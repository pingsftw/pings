class ProjectProfile < ActiveRecord::Migration
  def change
    add_column :projects, :url, :string
    add_column :projects, :logo_url, :string
    add_column :projects, :long_description, :text
    add_column :projects, :short_description, :string
  end
end
