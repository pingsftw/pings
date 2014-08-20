class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  def as_json(*args)
    so_far = super(*args)
    if errors
      so_far[:errors] = errors
    end
    so_far
  end
end
