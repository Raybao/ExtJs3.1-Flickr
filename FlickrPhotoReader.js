Ext.namespace('Flickr');

/*
Creates a reader to grab photo data from Flickr. Note that although
Flickr only shows the response as XML, there are several response formats available.
The XML maps to JSON, eg:

<photos>
   <photo id="1" />
   <photo id="2" />
</photos>

Will be

{
   photos:
   {
      photo: [{id: 1}, {id: 2}]
   }
}
*/
Flickr.FlickrPhotoReader = Ext.extend(Ext.data.JsonReader,
{
   constructor: function()
   {
      this.rec = Ext.data.Record.create(
      [
         'id',
         'owner',
         'secret',
         'server',
         { name: 'farm', type: 'int' },
         'title',
         { name: 'ispublic', type: 'boolean' },
         { name: 'isfriend', type: 'boolean' },
         { name: 'isfamily', type: 'boolean' },
         'media',
         'originalsecret'
      ]
      );
      Flickr.FlickrPhotoReader.superclass.constructor.call(this,
      {
         totalProperty: 'photos.total',
         root: 'photos.photo',
         id: 'id'
      }, this.rec);
   }
}
);