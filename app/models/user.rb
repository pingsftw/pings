class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  has_one :stellar_wallet
  has_many :payment_addresses
  has_many :payments, through: :payment_addresses
  def as_json(*args)
    so_far = super(*args)
    unless errors.empty?
      so_far[:errors] = errors
    end
    so_far[:payments] = payments.where("value > 0")
    so_far[:balances] = balances
    so_far[:stellar_id] = stellar_wallet.account_id
    so_far[:transactions] = transactions
    so_far
  end

  def ensure_stellar_wallet
    return stellar_wallet if stellar_wallet
    StellarWallet.create(user: self)
  end

  def balances
    ensure_stellar_wallet
    {
      webs: stellar_wallet.balance("WEB"),
      btc: stellar_wallet.balance("BTC")
    }
  end

  def transactions
    txs = stellar_wallet.buy_webs_transactions
    txs.each{|tx| tx[:project] = Project.by_wallet(tx[:account_id])}
  end

  def bid
    satoshis = balances[:btc]
    satoshis_per_btc = 10_000_000
    min_web_per_btc = 8_000
    max_satoshis_per_web = satoshis_per_btc / min_web_per_btc
    min_web = satoshis / max_satoshis_per_web
    stellar_wallet.offer(
      give: {currency: "BTC", qty: satoshis},
      receive: {currency: "WEB", qty: min_web}
    )
  end
end
