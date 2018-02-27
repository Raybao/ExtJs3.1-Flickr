/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
var flickr_url = 'https://api.flickr.com/services/rest/';
var user_id= 'xxxxxxx';
var api_key = 'xxxxxxxxxxxxx';

Ext.onReady(function() {

    Ext.QuickTips.init();
    // Album toolbar
    var newIndex = 3;

    this.listView = new Ext.list.ListView({
        store: new Ext.data.Store(
        {
            reader: new Flickr.FlickrPhotoSetReader(),
            proxy: new Flickr.FlickrProxy(
            {
                url: flickr_url,
                apiKey: api_key,
                method: 'flickr.photosets.getList',
                user_id: user_id
            }),
            listeners: {
                load: function(store,records,options) {
                        var p= new store.recordType({title:'Un-Grouped'});
                        store.insert(0,p);
                }
            }
        }),
        listeners:{
            click: function (list, index, node, e) {
                if (index>0) {
                        var rowRec = list.store.getAt(index);
                        var params = {
                                        photoset_id: rowRec.get('id')
                        };

                        var setListStore = getListStore();
                        this.view.bindStore(setListStore);
                        loadView(params);

                        this.detailWindow.store=setListStore;
                } else {
                        var defaultViewStore=getDefaultViewStore();
                        this.view.bindStore(defaultViewStore);
                        loadView();

                        this.detailWindow.store=defaultViewStore;
                }

            }.createDelegate(this)
        },

        emptyText: 'No images to display',
        reserveScrollOffset: true,
        region: 'west',
        width: 200,
        split: true,
        autoScroll:true,
        margins: '5 0 5 5',
        columns: [{
            header: 'Photo Set',
            dataIndex: 'title'
        }]
    });
    // set up the Album tree

    // Set up images view


    this.view = new Ext.DataView({
        store: getDefaultViewStore(),
        itemSelector: 'div.thumb-wrap',
        style:'overflow:auto',
        multiSelect: true,
        plugins: new Ext.DataView.DragSelector({dragSafe:true}),
        tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="thumb-wrap" id="{id}">',
                '<div class="thumb"><img src={[this.getImageUrl(values.farm,values.server,values.id,values.secret)]} class="thumb-img"></div>',
                '<span>{title}</span></div>',
                '</tpl>',
        {
            // XTemplate configuration:
            compiled: true,
            disableFormats: true,
            // member functions:
            getImageUrl: function(farm, server, id, secret) {
                return String.format('http://farm{0}.static.flickr.com/{1}/{2}_{3}_{4}.jpg', farm, server, id, secret, "s");
            },
            getViewUrl: function(owner, id) {
                return String.format('http://www.flickr.com/photos/{0}/{1}', owner, id);
            }
        }
                ),
        listeners: {
            click: function (view, index,node,e ) {
                 showInWindow(this.detailWindow,index);
            }.createDelegate(this)
        }

    });

    var images = new Ext.Panel({
        id:'images',
        title:'My Images',
        region:'center',
        margins: '5 5 5 0',
        layout:'fit',

        items: this.view
    });

    var layout = new Ext.Viewport({
        layout: 'border',
        items: [this.listView, images]
    });

    loadListView.call(this);


    loadView.call(this);

    layout.render('layout');

    this.detailWindow=openViewWindow(this.view.store,layout);

    var dragZone = new ImageDragZone(this.view, {containerScroll:true,
        ddGroup: 'organizerDD'});
});
getDefaultViewStore=function() {
        return new Ext.data.Store(
            {
                reader: new Flickr.FlickrPhotoReader(),
                proxy: new Flickr.FlickrProxy(
                {
                    url: flickr_url,
                    apiKey: api_key,
                    method: 'flickr.photos.search' ,
                    user_id: user_id,
                    extras: 'media,original_format'
                }
                        )
            });
};

getListStore = function() {
        return new Ext.data.Store(
                {
                        reader: new Flickr.FlickrPhotoSetPhotoReader(),
                        proxy: new Flickr.FlickrProxy(
                                        {
                                                url: flickr_url,
                                                apiKey: api_key,
                                                method: 'flickr.photosets.getPhotos',
                                                user_id: user_id,
                                                extras: 'media,original_format'
                                        }
                        )
                });
};

loadListView = function(passParam) {
    this.listView.store.load({params:passParam});
};
loadView = function(passParam) {
    this.view.store.load({params:passParam});
};

openViewWindow = function(store,main) {
   var w = new Flickr.FlickrWindow(
   {
      mainWindow: main,
      store: store,
      autoScroll:true,
      maximizable: true,
      monitorResize: true,
      width: 400,
      height: 400,
      bodyCfg: {
          id: 'windowBody'
      },
      closeAction: 'hide',
      listeners:
      {
         hide: function()
         {
            main.show();
         }
      }
   }
   );
   return w;
};

showInWindow = function (win,index) {
    win.active=index;
    win.show();
    win.setImage();
};
/**
 * Create a DragZone instance for our JsonView
 */
ImageDragZone = function(view, config) {
    this.view = view;
    ImageDragZone.superclass.constructor.call(this, view.getEl(), config);
};
Ext.extend(ImageDragZone, Ext.dd.DragZone, {
    // We don't want to register our image elements, so let's
    // override the default registry lookup to fetch the image
    // from the event instead
    getDragData : function(e) {
        var target = e.getTarget('.thumb-wrap');
        if (target) {
            var view = this.view;
            if (!view.isSelected(target)) {
                view.onClick(e);
            }
            var selNodes = view.getSelectedNodes();
            var dragData = {
                nodes: selNodes
            };
            if (selNodes.length == 1) {
                dragData.ddel = target;
                dragData.single = true;
            } else {
                var div = document.createElement('div'); // create the multi element drag "ghost"
                div.className = 'multi-proxy';
                for (var i = 0, len = selNodes.length; i < len; i++) {
                    div.appendChild(selNodes[i].firstChild.firstChild.cloneNode(true)); // image nodes only
                    if ((i + 1) % 3 == 0) {
                        div.appendChild(document.createElement('br'));
                    }
                }
                var count = document.createElement('div'); // selected image count
                count.innerHTML = i + ' images selected';
                div.appendChild(count);

                dragData.ddel = div;
                dragData.multi = true;
            }
            return dragData;
        }
        return false;
    },

    // this method is called by the TreeDropZone after a node drop
    // to get the new tree node (there are also other way, but this is easiest)
    getTreeNode : function() {
        var treeNodes = [];
        var nodeData = this.view.getRecords(this.dragData.nodes);
        for (var i = 0, len = nodeData.length; i < len; i++) {
            var data = nodeData[i].data;
            treeNodes.push(new Ext.tree.TreeNode({
                text: data.name,
                icon: host + '/view/' + data.url,
                data: data,
                leaf:true,
                cls: 'image-node'
            }));
        } 
        return treeNodes;
    },

    // the default action is to "highlight" after a bad drop
    // but since an image can't be highlighted, let's frame it
    afterRepair:function() {
        for (var i = 0, len = this.dragData.nodes.length; i < len; i++) {
            Ext.fly(this.dragData.nodes[i]).frame('#8db2e3', 1);
        }
        this.dragging = false;
    },

    // override the default repairXY with one offset for the margins and padding
    getRepairXY : function(e) {
        if (!this.dragData.multi) {
            var xy = Ext.Element.fly(this.dragData.ddel).getXY();
            xy[0] += 3;
            xy[1] += 3;
            return xy;
        }
        return false;
    }
});

// Utility functions

function shortName(name) {
    if (name.length > 15) {
        return name.substr(0, 12) + '...';
    }
    return name;
}
;
