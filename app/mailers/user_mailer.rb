class UserMailer < ActionMailer::Base
  default from: 'notifications@example.com'

  def welcome_email(user, address)
    @address = address.address
    mail(to: user.email, subject: 'Now for send us the BTCs')
  end

  def payment_email(user, payment)
    @value = payment.value / 10000000.0
    mail(to: user.email, subject: 'tx for BTC, sucka')
  end
end
