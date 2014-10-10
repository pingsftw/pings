class UsersController < ApplicationController
  def create
    user = User.create(email: params[:email], password: params[:password])
    if user.persisted?
      send_email(user)
      sign_in(user)
    end
    render json: user
  end

  def show
    render json: User.by_wallet(params[:id]).for_public
  end

  def support
    if current_user
      p = Project.find(params[:project_id])
      current_user.support p
      render json: {project: p}
    else
      render json: {user: "none"}
    end
  end

  def send_email(user)
      funding_secret = SecureRandom.hex
      funding_address = get_btc_address(funding_secret)
      pa = PaymentAddress.create!(user: user, secret: funding_secret, address: funding_address)
      UserMailer.welcome_email(user, pa).deliver
  end

  def get_btc_address(secret)
    master_address = "1JWvk53aChV2vF72U1LEuybFXvP1cHBumw"
    callback_url = "https://webs-tokens.herokuapp.com/payments?secret=#{secret}"
    url = "https://blockchain.info/api/receive?method=create&address=#{master_address}&callback=#{callback_url}"
    r = HTTParty.get url
    JSON.parse(r.body)["input_address"]
  end
end
