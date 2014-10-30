Rails.application.routes.draw do
  root 'home#index'
  resources :payments, :only => [:index]
  scope :format => true, :constraints => { :format => 'json' } do
    resource :stats do
      get :overview
    end
    resources :projects do
      get :totals
    end
    resources :transactions, only: [:index]
    resource :book, only: [:show]
    resources :cards, only: [:create] do
      collection do
        post :charge
        get :approve
      end
    end
    resources :gifts, only: [:create, :index]
    resources :users do
      collection do
        put :support
        post :username
        post :resend
      end
    end
    resource :sessions
  end
  devise_for :users, :controllers => { :confirmations => "confirmations" }
  get "*path", to: 'home#index'

end
