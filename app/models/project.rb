class Project < ActiveRecord::Base
  has_one :stellar_wallet

  def ensure_stellar_wallet
    return stellar_wallet if stellar_wallet
    StellarWallet.create(project: self)
  end
end
