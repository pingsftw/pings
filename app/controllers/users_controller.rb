class UsersController < ApplicationController
  def create
    user = User.create(email: params[:email], password: params[:password])
    render json: {errors: user.errors}
  end

  def show
    user = User.find_by_username(params[:id].downcase)
    user ||= User.by_wallet(params[:id])
    json = user.for_public
    json[:me] = user == current_user
    render json: json
  end

  def username
    name = params["username"].downcase
    claim = current_user.claim(name)
    render json: (claim.errors.empty? ? current_user : {errors: claim.errors})
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

  def send_btc_email(user)
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
