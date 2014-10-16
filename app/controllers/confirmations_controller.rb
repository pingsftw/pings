class ConfirmationsController < Devise::ConfirmationsController
  def show
    puts "hi"
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    if resource.errors.empty?
      sign_in(resource)
      redirect_to "/"
    else
      redirect_to "/confirmation_error"
      # respond_with_navigational(resource.errors, status: :unprocessable_entity){ render :new }
    end
  end
end
