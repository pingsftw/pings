var BaseView = Backbone.View.extend({
  render: function(){
    if (!this.templateName) {
      console.error("This view needs a templateName")
      console.trace()
      return
    }
    var template = $("#" + this.templateName + "-template")
    if (!template[0]) {
      console.error("You're missing the template for "+ this.templateName)
      return
    }
    console.log(template.html())
    var compiled = _.template(template.html())
    var params
    try {
      params = _.extend(this.params(), this.additionalParams())
      this.$el.html(compiled(params))
    } catch(err) {
      console.error("Error rendering template " + this.templateName)
      console.log("Passed attrs: ", params)
      console.log(err)
    }
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
  additionalParams: function(){return {}}
})


var FormView = BaseView.extend({
  callback: function(){},
  error: function(){},
  initialize: function(){
    console.log("init form", this)
  },
  events: {
    "submit form": "sumbit",
    "click button": "submit"
  },
  submit: function(){
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
    this.$(".error").empty()
    $.ajax(self.$("form").attr("action"), {
      type: self.$("form").attr("method"),
      data: vals,
      success: function(data){
        self.$("[type=submit]").removeAttr("disabled")
        if (data.errors && !_(data.errors).isEmpty()){
          _.each(data.errors, function(value, key){
            var div = self.$("[name="+key+"]").parent().find(".error")
            if (!div) {
              console.error("No error div for", key, value)
            }
            div.text(value)
          })

          self.error()
        } else {
          self.callback(data)
        }
        if (data.csrfToken) {
          $('meta[name="csrf-token"]').attr('content', data.csrfToken);
        }
      },
      error: function(e){
        self.$("[type=submit]").removeAttr("disabled")
        console.log(e)
        self.$(".error").text(e)
      },
      dataType: "json"
    })
    this.$("[type=submit]").attr("disabled", true)
    return false
  }
})

var LoadingView = Backbone.View.extend({
  render: function(){
    this.$el.html("LOADINGGG!!")
    return this
  }
})

var ChooserView = BaseView.extend({
 events: {
    "click .choice": function(e){
      var input =$(e.currentTarget).find("input")
      input.prop("checked", true)
      this.active()
      this.trigger("change")
    }
  },
  active: function(){
    this.$(".choice").removeClass("active")
    this.$("input:checked").parent().addClass("active")
  },
  val: function(){
    return this.$("input:checked").val()
  }
})

var ListView = BaseView.extend({
  initialize: function(){
    var self = this
    if (!this.collection){
      console.error("You need to pass a collection to " + this.templateName)
    }
    this.collection.bind("sync", function(){self.populate()})
    if (this.collection.url) {
      this.collection.fetch()
    }
  },
  populate: function(){
    var self = this
    if (!this.itemName) {
      console.error("You need an item name for " + this.templateName)
    }
    var view = eval(this.itemName + "ItemView")
    var table = this.$("table").length
    var tagName = table ? "tr" : "li"
    var target = table ? this.$("table") : this.$("ul")
    this.collection.each(function(dataItem){
      var item = new view({model: dataItem, tagName: tagName, attributes: self.attributes}).render()
        target.append(item.el)
    })
    if (!this.collection.length) {
      this.$(".empty").show()
    }
    if (!this.loading) {
      console.error("You need to explicitly render " + this.templateName)
    }
    this.loading.remove()
  },
  extendedRender: function(){
    this.$(".empty").hide()
    this.loading = new LoadingView().render()
    this.$el.append(this.loading.el)
    if (this.collection.length) {
      this.populate()
    }
  }
})



