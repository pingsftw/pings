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
  has_many :sent_gifts, foreign_key: :giver_id, class_name: "Gift"

  validates :username, uniqueness: true, allow_nil: true

  after_create :ensure_stellar_wallet, :check_for_gifts
  UsernameMinimum = 100

  def available_tokens
    stellar_wallet.balance("WEB") - outstanding_gift_value
  end

  def outstanding_gift_value
    sent_gifts.where(transaction_hash: nil).sum(:value)
  end

  def wallet_ready
    stellar_wallet.setup
  end

  def check_for_gifts
    gifts = Gift.where(receiver_email: email)
    # gifts.update(receiver: self) #This apparently is not a thing
    stellar_wallet.setup unless gifts.empty?
    gifts.each{|g|g.receiver = self; g.deliver; g.save}
  end

  def give(opts)
    value = opts[:value]
    if opts[:email]
      gift = Gift.create(giver: self, receiver_email: receiver_email, value: value)
    else
      receiver = User.by_wallet(opts[:stellar_id])
      gift = Gift.create(giver: self, receiver: receiver, value: value)
    end
    gift.process if gift.persisted?
    gift
  end

  def claim(username)
    if stellar_wallet.balance("WEB") < UsernameMinimum
      return {errors:
          {username: "You must have at least #{UsernameMinimum} #{TOKEN_NAME} to choose a username"}
      }
    end
    update_attributes(username: username)
    self
  end

  def self.by_wallet(account_id)
    StellarWallet.find_by_account_id(account_id).user
  end

  def icon_url
    "http://www.gravatar.com/avatar/#{Digest::MD5.hexdigest(email)}"
  end

  def for_public
    {
      stellar_id: stellar_wallet.account_id,
      username: username,
      supporting: stellar_wallet.supported_project_id,
      icon_url: icon_url
    }
  end

  def as_json(*args)
    so_far = super(*args)
    unless errors.empty?
      so_far[:errors] = errors
    end
    so_far[:payments] = payments.where("value > 0")
    so_far[:card] = cards.last
    so_far[:webs_balance] = nil
    so_far[:confirmed] = confirmed?
    if stellar_wallet
      so_far[:supporting] = stellar_wallet.supported_project_id
      so_far[:stellar_id] = stellar_wallet.account_id
    end

    so_far
  end

  def support(project)
    stellar_wallet.update_attributes(supported_project: project)
    # stellar_wallet.set_inflation(project.stellar_wallet.account_id)
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
    txs.each{|tx| tx[:project_name] = projects[tx[:account_id]] ? projects[tx[:account_id]].name : tx[:account_id]}
    txs
  end

  def bid(currency)
    stellar_wallet.offer(
      give: {currency: currency, qty: balances[currency]},
      receive: {currency: "WEB", qty: 1},
      sellMode: true
    )
  end

  protected
  def confirmation_required?
    false
  end
end
