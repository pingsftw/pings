class AddStripeRecipients < ActiveRecord::Migration
  def change
    create_table :stripe_recipients do |t|
      t.string :stripe_id
      t.boolean :livemode
      t.timestamp :created
      t.string :stripe_type
      t.json :active_account
      t.string :description
      t.string :email
      t.json :metadata
      t.string :name
      t.json :cards
      t.boolean :has_more
      t.boolean :verified
      t.string :url
      t.integer :total_count
      t.string :default_card
      t.integer :project_id
      t.string :object
    end
  end
end
