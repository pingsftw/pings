class UserMailer < ActionMailer::Base
  default from: 'notifications@example.com'

  def welcome_email(user)
    @address = user.funding_address
    mail(to: user.email, subject: 'Now for send us the BTCs')
  end
end
