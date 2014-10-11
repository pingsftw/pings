class Card < ActiveRecord::Base
  belongs_to :user
  has_many :charges
end
