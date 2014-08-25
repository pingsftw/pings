class Payment < ActiveRecord::Base
  belongs_to :payment_address
  def process!
    payment_address.user.ensure_stellar_wallet
  end
end
