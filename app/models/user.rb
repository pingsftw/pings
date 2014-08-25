class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  has_one :stellar_wallet
  has_many :payment_addresses
  def as_json(*args)
    so_far = super(*args)
    unless errors.empty?
      so_far[:errors] = errors
    end
    so_far
  end

  def ensure_stellar_wallet
    return stellar_wallet if stellar_wallet
    StellarWallet.create(user: self)
  end
end
