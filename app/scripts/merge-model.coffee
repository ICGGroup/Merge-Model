define [], ()->
  
  merge = (source, template)->
    if template is undefined
      result = source
    else
      if _.isArray(source)
        result = []
        for i, idx in source
          if idx > (template.length-1)
            templateIdx = (idx % (template.length))
          else
            templateIdx = idx
          result.push merge(i, template[templateIdx])
          
      else if _.isFunction(source)
        result = source.call()
      else if _.isObject(source)
        result = {}
        for p of template
          if source.hasOwnProperty(p)
            result[p] = merge(source[p], template[p])
          else
            result[p] = merge(template[p])

        # now loop through the source an capture source objects missing and push
        for so of source
          if not template.hasOwnProperty(so)
            result[so] = source[so]

      else
        result = source

    result

  class MergeModel extends Backbone.Model
    constructor: (model, template, options)->
      merged = merge(model, template)
      super(merged, options)
      @url = options?.url

  MergeModel