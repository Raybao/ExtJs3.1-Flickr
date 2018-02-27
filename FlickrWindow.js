Ext.namespace('Flickr');

Flickr.FlickrWindow = Ext.extend(Ext.Window,
{
   store: null,
   resizable: true,
   constrain: true,
   imageSize: 'b',
   title: 'Flickr Window',

   initComponent: function()
   {
      Ext.QuickTips.init();
      Ext.apply(this,
      {
         tbar:
         [
            {
               iconCls: 'x-tbar-page-prev',
               handler: this.onPreviousClick,
               scope: this,
               tooltip: { text: 'Go to the previous image' }
            },
            {
               iconCls: 'x-tbar-page-next',
               handler: this.onNextClick,
               scope: this,
               tooltip: { text: 'Go to the next image' }
            },
            '->',
			   {
			      iconCls: 'sizer',
			      tooltip: { text: 'Set the size of the images' },
			      menu:
				   {
				      items:
				      [
				         this.createSizeItem('Small', 's'),
				         this.createSizeItem('Thumb', 't'),
				         this.createSizeItem('Medium', 'm'),
				         this.createSizeItem('Big', 'b'),
                         this.createSizeItem('Original', 'o')
   				   ]
				   }
			   },
		   	'-',
		   	{
		   	   iconCls: 'view',
		   	   handler: this.onViewClick,
		   	   scope: this,
		   	   tooltip: { text: 'View this photo at the Flickr site' }
		   	}
         ]
      }
      );
      Flickr.FlickrWindow.superclass.initComponent.call(this);
      this.store.on('beforeload', this.onBeforeLoad, this);
      this.store.on('load', this.onLoad, this);
      this.active = 0;
   },

   createSizeItem: function(label, code)
   {
      return {
         text: label,
         group: 'imageSize',
         checked: this.imageSize == code,
         handler: this.setImageSize.createDelegate(this, [code], false)
      };
   },

   afterRender: function()
   {
      Flickr.FlickrWindow.superclass.afterRender.call(this);
      //hide the image initially
      this.img = Ext.DomHelper.append(this.body, { tag: 'img', alt: '', src: '', cls: 'x-hide-display' }, true);
      this.img.setVisibilityMode(Ext.Element.DISPLAY);
      this.img.on('load', this.onImageLoad, this);
      this.on('resize',this.onWinResize, this);

   },

   doSearch: function()
   {
      var text = this.searchBox.getValue().trim();
      if (text.length > 0)
      {
         text = text.replace(/ /g, ',');
         this.store.load();
      }
   },

   onViewClick: function()
   {
      window.open(this.viewUrl);
   },

   onPreviousClick: function()
   {
      if (this.active == 0)
         this.active = this.store.getCount() - 1
      else
         --this.active;

      this.setImage();
   },

   onNextClick: function()
   {
      if (this.active == this.store.getCount() - 1)
         this.active = 0;
      else
         ++this.active;

      this.setImage();
   },

   onBeforeLoad: function()
   {
      if (!this.masked)
      {
         this.body.mask('Loading', 'x-mask-loading');
         this.getTopToolbar().disable();
         this.masked = true;
      }
   },

   onLoad: function()
   {
      this.active = 0;
      this.setImage();
   },

   onImageLoad: function()
   {
      this.body.unmask();
      this.getTopToolbar().enable();
      this.masked = false;
      var title = this.img.dom.alt;
      if (title == '')
         title = 'Untitled';

      this.setTitle(Ext.util.Format.ellipsis(this.img.dom.alt, this.getTextSize()));
       this.restore();
      this.img.removeClass('x-hide-display');
      var sz = this.img.getSize();
      if (sz.width < 110)
         sz.width = 110;

       if (sz.width > this.mainWindow.getSize().width*0.9||sz.height>this.mainWindow.getSize().height*0.9)
            this.maximize();
       else {
           this.un('resize',this.onWinResize, this);
            this.body.setSize(sz);
            this.syncSize();
            this.setWidth(sz.width + 14);
           this.on('resize',this.onWinResize, this);
       }
   //   this.img.fadeIn({ duration: 1 });
   },

   onWinResize: function(win,newWidth,newHeight) {
        var sz=win.img.getSize();
        var bodySz=win.body.getSize();
        if (!(win.maximized&&(sz.width>bodySz.width||sz.height>bodySz.height)))
            win.img.setSize(win.body.getSize());
},

   getTextSize: function()
   {
      switch (this.imageSize)
      {
         case 's': return 10;
         case 't': return 12;
         case 'm': return 25;
         default: return 40;
      }
   },

   setImage: function()
   {
      this.onBeforeLoad();
      var rec = this.store.getAt(this.active);
      this.constructUrl(rec);
      this.img.dom.alt = rec.get('title');
      if (rec.get('media')=='video') {
            this.restore();
            this.img.hide();
            this.flickr_video_embed(this.videoUrl,640,480,true);
      }
       else {
        if (this.flashE)
            this.flashE.remove();
        this.img.dom.style.width="";
        this.img.dom.style.height="";
        this.img.show();
        this.img.dom.src = this.imageUrl;
      }
   },

   constructUrl: function(rec)
   {
      //construct the URL for the photo as per: http://www.flickr.com/services/api/misc.urls.html
      if (this.imageSize=='o') {
          var secretCode=rec.get('originalsecret');
      } else
        var secretCode=rec.get('secret');

      this.imageUrl = String.format('http://farm{0}.static.flickr.com/{1}/{2}_{3}_{4}.jpg', rec.get('farm'), rec.get('server'), rec.get('id'), secretCode, this.imageSize);
      this.viewUrl = String.format('http://www.flickr.com/photos/{0}/{1}', rec.get('owner'), rec.get('id'));
       this.videoUrl = String.format('http://www.flickr.com/apps/video/stewart.swf?v={0}&photo_id={1}&photo_secret={2} media=video', rec.get('server'), rec.get('id'), rec.get('secret'));
   },
    flickr_video_embed: function(video_url, width, height, info_box) {
        if (this.flashE)
              this.flashE.remove();
        
        var flashTag={
            tag: 'div',
            children:[
        {
            id: 'flashObject',
            tag: 'object',
            type: 'application/x-shockwave-flash',
            width: width,
            height: height,
            data: video_url,
            classid: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",

            children: [
        {
            tag: 'param',
            name: 'falshvars',
            value: 'flickr_show_info_box='+info_box
        },
        {
            tag: 'param',
            name: 'movie',
            value: video_url
        },
        {
            tag: 'param',
            name:'bgcolor',
            value:'#000000'
        },
        {
            tag: 'param',
            name: 'allowFullScreen',
            value: 'true'
        },
        {
            tag: 'embed',
            type:'application/x-shockwave-flash',
            src: video_url,
            bgcolor:'#000000',
            allowfullscreen:'true',
            flashvars:'flickr_show_info_box='+info_box,
            width: width,
            height: height
        }]
        }]
        };

        var sz={
            height: height,
            width: width
        }
        this.body.setSize(sz);
        this.syncSize();
        this.setWidth(sz.width + 14);

        this.flashE=Ext.DomHelper.append('windowBody',flashTag,true);

        this.body.unmask();
        this.getTopToolbar().enable();
        this.masked = false;

/*
<object type="application/x-shockwave-flash" width="$width" height="$height" data="$video_url"  classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">
        <param name="flashvars" value="flickr_show_info_box=$info_box"></param>
        <param name="movie" value="$video_url"></param>
        <param name="bgcolor" value="#000000"></param>
        <param name="allowFullScreen" value="true"></param>
        <embed type="application/x-shockwave-flash" src="$video_url" bgcolor="#000000" allowfullscreen="true" flashvars="flickr_show_info_box=$info_box" height="$height" width="$width">
        </embed>
</object>
*/
},

   setImageSize: function(sz)
   {
      var prev = this.imageSize;
      this.imageSize = sz;
      if (sz != prev)
         this.setImage();
   }
}
);
