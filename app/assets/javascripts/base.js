var BaseView = Backbone.View.extend({
  render: function(){
    if (!this.templateName) {
      console.log("This view needs a templateName")
      console.trace()
      return
    }
    var template = $("#" + this.templateName + "-template")
    if (!template[0]) {
      console.log("You're missing the template for "+ this.templateName)
      return
    }
    var compiled = _.template(template.html())
    this.$el.html(compiled(this.params()))
    this.extendedRender()
    this.postRender()
    console.log("rendered " + this.templateName, this.el, this.params())
    return this
  },
  params: function(){
    if (this.model) {
      if (!this.model.toJSON) {
        return this.model
      }
      return this.model.toJSON()
    }
    if (this.collection) {
      return this.collection
    }
    if (this.attributes) {
      return this.attributes
    }
  },
  extendedRender: function(){},
  postRender: function(){},
})


var FormView = BaseView.extend({
  callback: function(){},
  error: function(){},
  events: {
    "submit": function(){
      console.log("sumbit", this)
      var self=this
      var vals = {}
      this.$("input").each(function(i, el){
        var $e = $(el)
        vals[$e.attr("name")] = $e.val()
      })
      this.$("select").each(function(i, el){
        var $e = $(el)
        vals[$e.attr("name")] = $e.val()
      })
      $.ajax(self.$("form").attr("action"), {
        type: self.$("form").attr("method"),
        data: vals,
        success: function(data){
          if (data.errors){
            _.each(data.errors, function(value, key){
              var div = this.$("[name="+key+"]").parent().find(".error")
              div.text(value)
            })

            self.error()
          }
          self.$("[type=submit]").removeAttr("disabled")
          if (data.csrfToken) {
            $('meta[name="csrf-token"]').attr('content', data.csrfToken);
          }
          self.callback(data)
        },
        dataType: "json"
      })
      this.$("[type=submit]").attr("disabled", true)
      return false
    }
  }
})

var LoadingView = Backbone.View.extend({
  render: function(){
    this.$el.html("LOADINGGG!!")
    return this
  }
})

var ListView = BaseView.extend({
  initialize: function(){
    var self = this
    this.collection.bind("reset", function(){self.populate()})
    this.collection.fetch({reset: true})
  },
  populate: function(){
    var self = this
    var view = eval(this.itemName + "ItemView")
    this.collection.each(function(dataItem){
      var item = new view({model: dataItem}).render()
        self.$("ul").append(item.el)
    })
    this.loading.remove()
  },
  extendedRender: function(){
    this.loading = new LoadingView().render()
    this.$el.append(this.loading.el)
  }
})



