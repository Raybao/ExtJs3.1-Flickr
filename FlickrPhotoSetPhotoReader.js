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
/*<photosets cancreate="1">
	<photoset id="5" primary="2483" secret="abcdef"
		server="8" photos="4" farm="1">
		<title>Test</title>
		<description>foo</description>
	</photoset>
	<photoset id="4" primary="1234" secret="832659"
		server="3" photos="12" farm="1">
		<title>My Set</title>
		<description>bar</description>
	</photoset>
</photosets>
*/
Flickr.FlickrPhotoSetPhotoReader = Ext.extend(Ext.data.JsonReader,
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
      Flickr.FlickrPhotoSetPhotoReader.superclass.constructor.call(this,
      {
         totalProperty: 'photoset.total',
         root: 'photoset.photo',
         id: 'id'
      }, this.rec);
   }
}
);