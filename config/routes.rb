Rails.application.routes.draw do
  root 'home#index'
  resource :payments, :only => [:create]
  scope :format => true, :constraints => { :format => 'json' } do
    resources :users do
      collection do
        post :resend
      end
    end
    resource :sessions
  end
  get "*path", to: 'home#index'
  devise_for :users

end
