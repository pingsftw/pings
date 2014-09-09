class UsersController < ApplicationController
  def create
    user = User.create(email: params[:email], password: params[:password])
    if user.persisted?
      send_email(user)
      sign_in(user)
    end
    render json: user
  end

  def resend
    if current_user
      send_email(current_user)
      render json: {email: "sent"}
    else
      render json: {user: "none"}
    end
  end

  def support
    if current_user
      current_user.support Project.find(params[:project_id])
      render json: {status: "ok"}
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
