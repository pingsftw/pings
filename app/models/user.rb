class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable
  has_one :stellar_wallet
  has_many :payment_addresses
  has_many :cards
  has_many :payments, through: :payment_addresses

  def give(receiver_email, value)
    gift = Gift.create(giver: self, receiver_email: receiver_email, value: value)
    gift.process
  end

  def self.by_wallet(account_id)
    StellarWallet.find_by_account_id(account_id).user
  end

  def for_public
    {
      stellar_id: stellar_wallet.id,
      supporting: stellar_wallet.supporting,
      webs: balances[:webs]
    }
  end

  def as_json(*args)
    so_far = super(*args)
    unless errors.empty?
      so_far[:errors] = errors
    end
    so_far[:payments] = payments.where("value > 0")
    so_far[:card] = cards.last
    if stellar_wallet
      so_far[:balances] = balances
      so_far[:stellar_id] = stellar_wallet.account_id
      so_far[:supporting] = stellar_wallet.supporting
    end

    so_far
  end

  def support(project)
    stellar_wallet.set_inflation(project.stellar_wallet.account_id)
  end

  def ensure_stellar_wallet
    return stellar_wallet if stellar_wallet
    StellarWallet.create(user: self)
  end

  def balances
    ensure_stellar_wallet
    {
      webs: stellar_wallet.balance("WEB"),
      btc: stellar_wallet.balance("BTC"),
      usd: stellar_wallet.balance("USD")
    }
  end

  def transactions
    txs = stellar_wallet.buy_webs_transactions
    txs.each{|tx| tx[:project] = Project.by_wallet(tx[:account_id])}
  end

  def bid(currency)
    stellar_wallet.offer(
      give: {currency: currency, qty: balances[currency]},
      receive: {currency: "WEB", qty: 1},
      sellMode: true
    )
  end
end
