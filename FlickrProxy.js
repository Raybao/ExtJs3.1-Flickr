Ext.namespace('Flickr');

/*
Utility class for connecting to Flickr
*/
Flickr.FlickrProxy = Ext.extend(Ext.data.ScriptTagProxy,
{
   apiKey: null,
   callbackParam: 'jsoncallback',

   constructor: function(config)
   {
      Flickr.FlickrProxy.superclass.constructor.call(this, config);
      this.on('beforeload', this.onBeforeLoad.createDelegate(this) );
   },

   onBeforeLoad: function(o, params)
   {
      Ext.apply(params,
      {
         format: 'json',
          api_key: this.apiKey,
          method: params.method||this.method,
          user_id: params.user_id||this.user_id,
          extras: params.extras||this.extras
      }
      );
      return true;
   }
}
);