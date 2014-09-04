Rails.application.routes.draw do
  root 'home#index'
  resources :payments, :only => [:index]
  scope :format => true, :constraints => { :format => 'json' } do
    resources :projects
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
