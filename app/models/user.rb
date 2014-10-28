class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable
  has_one :stellar_wallet
  has_many :payment_addresses
  has_many :cards
  has_many :payments, through: :payment_addresses
  has_many :received_gifts, foreign_key: :receiver_id, class_name: "Gift"

  validates :username, uniqueness: true

  after_create :check_for_gifts

  def check_for_gifts
    gifts = Gift.where(receiver_email: email)
    # gifts.update(receiver: self) #This apparently is not a thing
    ensure_stellar_wallet unless gifts.empty?
    gifts.each{|g|g.receiver = self; g.deliver; g.save}
  end

  def give(receiver_email, value)
    gift = Gift.create(giver: self, receiver_email: receiver_email, value: value)
    gift.process
  end

  def claim(username)
    update_attributes(username: username)
    self
  end

  def self.by_wallet(account_id)
    StellarWallet.find_by_account_id(account_id).user
  end

  def for_public
    {
      stellar_id: stellar_wallet.id,
      supporting: stellar_wallet.supporting,
      username: username,
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
    projects = Project.for_wallets(txs.map{|tx| tx[:account_id]})
    txs.each{|tx| tx[:project_name] = projects[tx[:account_id]].name}
    txs
  end

  def bid(currency)
    stellar_wallet.offer(
      give: {currency: currency, qty: balances[currency]},
      receive: {currency: "WEB", qty: 1},
      sellMode: true
    )
  end
end
