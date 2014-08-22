class UsersController < ApplicationController
  def create
    user = User.create(email: params[:email], password: params[:password])
    if user.persisted?
      user.funding_address = get_btc_address
      user.funding_secret = SecureRandom.hex
      user.save!
      UserMailer.welcome_email(user).deliver
      sign_in(user)
    end
    render json: user
  end

  def get_btc_address(secret)
    master_address = "1JWvk53aChV2vF72U1LEuybFXvP1cHBumw"
    callback_url = "https://webs-tokens.herokuapp.com/payments"
    url = "https://blockchain.info/api/receive?method=create&address=#{master_address}&callback=#{callback_url}&secret=#{secret}"
    r = HTTParty.get url
    JSON.parse(r.body)["input_address"]
  end
end
