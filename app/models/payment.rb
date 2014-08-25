class Payment < ActiveRecord::Base
  belongs_to :payment_address
  def process!
    user.ensure_stellar_wallet
  end
end
