class UserMailer < ActionMailer::Base
  default from: 'notifications@example.com'

  def welcome_email(user, address)
    @address = address.address
    @gifts = user.received_gifts
    mail(to: user.email, subject: "Welcome to #{TOKEN_NAME}, the Internet Loyalty Community")
  end

  def payment_email(user, payment)
    @value = payment.value / 100000000.0
    mail(to: user.email, subject: 'tx for BTC, sucka')
  end

  def usd_email(user, payment)
    @amount = payment.amount / 100.0
    mail(to: user.email, subject: 'Dollars are the best')
  end

  def gift_invitation_email(gift)
    @value = gift.value
    @sender = gift.giver.email
    @receiver = gift.receiver.email
    mail(to: gift.receiver_email, subject: "@sender has given you some #{TOKEN_NAME} for the internet!")
  end

  def gift_email(gift)
    @value = gift.value
    mail(to: gift.receiver_email, subject: "Someone sent you more #{TOKEN_NAME}!")
  end

  def user_approval_email(user, charge)
    @user = user
    @charge = charge
    mail(to: user.email, subject: "Thanks! Hang tight while we look things over")
  end

  def admin_approval_email(user, charge)
    @user=user
    @charge=charge
    mail(to: ADMIN_EMAIL, subject: "Approval needed")
  end
end
