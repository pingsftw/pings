class Payment < ActiveRecord::Base
  belongs_to :user
  def process!
    user.ensure_stellar_wallet
  end
end
