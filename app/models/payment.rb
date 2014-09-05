class Payment < ActiveRecord::Base
  belongs_to :payment_address
  def process!
    payment_address.user.ensure_stellar_wallet
  end
  def as_json *args
    h = super *args
    # h["created_at"] = h["created_at"].getutc.iso8601
    h
  end
end
