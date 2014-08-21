class UsersController < ApplicationController
  def create
    user = User.create(email: params[:email], password: params[:password])
    if user.persisted?
      user.funding_address = get_btc_address
      user.save!
      UserMailer.welcome_email(user).deliver
      sign_in(user)
    end
    render json: user
  end

  def get_btc_address
    master_address = "1JWvk53aChV2vF72U1LEuybFXvP1cHBumw"
    callback_url = "http://webs-tokens.herokuapp.com/payments"
    url = "https://blockchain.info/api/receive?method=create&address=#{master_address}&callback=#{callback_url}"
    r = HTTParty.get url
    JSON.parse(r.body)["input_address"]
  end
end
