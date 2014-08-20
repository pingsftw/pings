Rails.application.routes.draw do
  root 'home#index'
  scope :format => true, :constraints => { :format => 'json' } do
    resources :users
    resources :sessions
  end
  get "*path", to: 'home#index'
  devise_for :users

end
