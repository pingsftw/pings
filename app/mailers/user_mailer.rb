class UserMailer < ActionMailer::Base
  default from: 'notifications@example.com'

  def welcome_email(user, address)
    @address = address.address
    mail(to: user.email, subject: 'Now for send us the BTCs')
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
    mail(to: gift.receiver_email, subject: "You've got Webs!")
  end
end
