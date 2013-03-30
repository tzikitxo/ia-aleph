/*
	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

log('loading 29: armylist utils');
    
// BEGIN import/export
var importList=armyList.importList=function(list){
    armyList.clear();
    debug('importing list : ',list);
    if(list.sectorial!=units.sectorialName||list.faction!=units.factionName){
        debug("faction+sectorial don't match, aborting import");
        return;
    }
    setPointCap(list.pcap);
    if(list.specop){
        units.importSpecop(list.specop);
    }
    $.each(list.models,function(index,unit){
        var unitRecord=units.unitsByIsc[unit.isc]
        if(!unitRecord){
            log('unit not found for isc : '+unit.isc);
            return;
        }
        var modelRecord=unitRecord.childsByCode[unit.code];
        if(!modelRecord){
            log('unit child not found for isc/code : '+unit.isc+' / '+unit.code);
            return;
        }
        pushModelAndCompanions(modelRecord,null,unit.recordid);
    });
    armyList.listId=list.listId||list.id; // legacy
    armylist.setListName(list.listName,true);
    if(!armyList.listId){
        armyList.newListId();
    }
    if(list.groupMarks){
        armyList.setGroupMarks(list.groupMarks);
    }
    armyList.combatGroupSize=Number(list.combatGroupSize)||10;
    validateList();
};   
var importListStr=armyList.importListStr=function(listStr){ 
    importList(decodeList(listStr));
};
var exportList=armyList.exportList=function(){
    var models=[];
    var specop=null;
    $.each(armyList.getListRecordsAsList(),function(index,listRecord){
        if(listRecord.parentRecord){
            return; // won't export companions, will be re-added on import
        }
        models.push({
            'isc':listRecord.model.parent.isc,
            'code':listRecord.model.code,
            'recordid':listRecord.id
        });
        if(listRecord.model.parent.specop){
            specop={
                base:listRecord.model.parent.base,
                extra:listRecord.model.parent.extra
            };
        }
    });
    return {
        //            'name':armyList.name,
        'pcap':armyList.pointCap,
        'faction':units.factionName,
        'sectorial':units.sectorialName,
        'includeMercs':units.includeMercs,
        'models':models,
        'listId':armyList.listId,
        'id':armyList.listId, // legacy
        'listName':armyList.listName,
        'dateMod':(new Date()).toISOString(),
        'groupMarks':armyList.getGroupMarks(),
        'combatGroupSize':armyList.combatGroupSize,
        'specop':specop,
        'mercenaryFactions':units.factionName=='Mercenary Company'?units.mercenaryFactions:null
    };
};
var encodeList=armyList.encodeList=utils.encodeData;
var decodeList=armyList.decodeList=utils.decodeData;

var exportListStr=armyList.exportListStr=function(){
    return encodeList(exportList());
};
var exportListUrl=armyList.exportListUrl=function(){
    // must be absolute url !
    return utils.getAbsoluteBasePath()+'ia.html?list='+escape(exportListStr());
};
// END import/export

// export view
armyList.exportAndShowList=function(){
    var listUrl=exportListUrl();
    var modelRecords=armyList.getListRecordsAsList();
    var popup=$('#genericPopup'),popupContent=$('#genericPopupContent',popup).empty();
    var exportContainer=$('<div class="listExport"></div>').appendTo(popupContent);
    var buttons=$('<div class="exportButtons" />').appendTo(popupContent);
    var forumCode='';
    var absoluteBasePath=utils.getAbsoluteBasePath(),
    armyText=' '+units.getFactionNameDisplay()+(units.sectorialName?(' - '+units.getSectorialNameDisplay()):'')+'  |  '+armyList.modelCount+' '+messages.get('armylist.listinfo.modelCount'),
    spacer='________________________________________________________';
    forumCode+='[img]'+absoluteBasePath+units.faviconPath+'[/img][b]'+armyText+'[/b]\n[b]'+spacer+'[/b]\n\n';
    var previewContainer=$('<div />').appendTo(exportContainer);
    previewContainer.append($('<div></div>')
        .text(armyText).css("font-weight","bold")
        .prepend('<image src="'+units.faviconPath+'" />'))
    .append($('<div></div>').text(spacer).css("font-weight","bold")).append('<br/>');
    var groupMarks=armyList.getGroupMarks(),i=0,cg=1;
    function addModel(modelData){
        //        var modelData=units.unitsByIsc[model.isc].childsByCode[model.code];
        var codename=modelData.getDisplay('codename');
        if(codename=='Default'||codename==''||!codename||codename==' '){
            codename='';
        }
        var costText=(modelData.parent.isPseudoUnit?'':(' ('+modelData.cost+'|'+modelData.swc+')')),
        modelTextForum=' '+modelData.getDisplay('name')+" [i]"+codename+"[/i]"+costText,
        modelLogo=utils.buildImagePath(modelData.get('isc'),'logo_small');
        if(groupMarks[0]===i){
            var text=messages.get('armylist.groups.groupTitle')+cg;
            forumCode+='[b]'+text+'[/b]\n';
            $('<div></div>').css("font-weight","bold").text(text).appendTo(previewContainer);
            groupMarks.splice(0,1);
            cg++;
        }
        i++;
        forumCode+='[img]'+absoluteBasePath+modelLogo+'[/img]'+modelTextForum+'\n';
        previewContainer.append($('<div></div>')
            .text(' '+modelData.getDisplay('name')+' ')
            .append($('<i />').text(codename))
            .append(costText)
            .prepend('<image src="'+modelLogo+'" />'))
    }
    $.each(modelRecords,function(index,listRecord){
        addModel(listRecord.model);
    });
    var armyInfoText=armyList.pointCount+'/'+armyList.getEffectivePointCap()+' '+messages.get('armylist.listinfo.pointsCount')
    +' | '+armyList.swcCount+'/'+armyList.getEffectiveSwcCap()+' '+messages.get('armylist.listinfo.swcCount');
    forumCode+='[b]'+spacer+'[/b]\n\n[b]'+armyInfoText+'[/b]\n';
    previewContainer
    .append($('<div></div>').text(spacer).css("font-weight","bold")).append('<br/>')
    .append($('<div></div>').text(armyInfoText).css("font-weight","bold"));
    if(armyList.warnings.length>0){
        var warningText=messages.get('armylist.export.warningsTitle')+armyList.warnings.join(', ');
        forumCode+=warningText+'\n';
        previewContainer.append($('<div></div>').text(warningText));
    }
    forumCode+=messages.get('armylist.export.openDesc')+' [img]'+absoluteBasePath+'images/app_logo_small.png[/img] : ';
    var forumCodeTextarea=$('<textarea cols="120" rows="20"  />');
    
    previewContainer.append(messages.get('armylist.export.openDesc')+' <img src="images/app_logo_small.png" /> : ');
    var urlHref=$('<a />').text(messages.get('armylist.export.directLink')).appendTo(previewContainer);
    var qrcode=$('<div />');
        
    if(device.hasCordova()){
        urlHref.bind('click',function(event){
            return false; 
        });
    }
    
    function fillForUrl(listUrl){
        var shortUrl=listUrl.length<24;
        forumCodeTextarea.val(forumCode+'[url='+listUrl+']'+(shortUrl?listUrl:messages.get('armylist.export.directLink'))+'[/url]\n');
        urlHref.attr('href',listUrl);
        if(shortUrl){
            urlHref.text(listUrl);
        }
        try{
            qrcode.empty().qrcode({
                text:listUrl
            });
        }catch(e){
            log('qrcode error',e);
        }
    }
   
    //var htmlPreviewCode=exportContainer.html();
    //  var tinyUrl=listUrl;
    // var loadingTiny=$('<div>preparing tiny direct url <img src="images/loading.gif" /></div>').appendTo(previewContainer);
   
        
    // utils.getTinyUrl(listUrl,function(tu){
    //      tinyUrl=tu?tu:listUrl;
    //     loadingTiny.remove();
    //        previewContainer.append('open with IA by Aleph <img src="images/app_logo_small.png" /> : ')
    //        .append('<a href="'+tinyUrl+'">direct link</a>');
    //        forumCodeTextarea.val(forumCodeTextarea.val()+'open with IA by Aleph [img]'+basePath+'images/app_logo_small.png[/img] : '
    //            +'[url]'+tinyUrl+'[/url]\n');
    //  });
    
    $('<div class="exportButton" />').text(messages.get('armylist.export.closeButton')).bind('click',function(){
        $('#rootContainer').show();
        popup.hide();
        popupContent.empty();
        armylist.popupScroller.disableScroll();
    }).appendTo(buttons);
    var previewButton=$('<div class="exportButton selected" />').text(messages.get('armylist.export.previewButton')).bind('click',function(){
        $('.exportButton.selected',buttons).removeClass('selected');
        previewButton.addClass('selected');
        exportContainer.empty().append(previewContainer);
        armylist.popupScroller.updateScroll();
    }).appendTo(buttons);
    var forumButton=$('<div class="exportButton" />').text(messages.get('armylist.export.bbcodeButton')).bind('click',function(){
        $('.exportButton.selected',buttons).removeClass('selected');
        forumButton.addClass('selected');
        exportContainer.empty().append(forumCodeTextarea);
        $('textarea',exportContainer).select();
        armylist.popupScroller.updateScroll();
    }).appendTo(buttons);
    var qrButton=$('<div class="exportButton" />').text(messages.get('armylist.export.qrcodeButton')).bind('click',function(){
        //  if(tinyUrl){
        $('.exportButton.selected',buttons).removeClass('selected');
        qrButton.addClass('selected');
        exportContainer.empty().append(qrcode);
        armylist.popupScroller.updateScroll();
    //   }
    }).appendTo(buttons);
    //    $('<div class="exportButton" />').text(messages.get('armylist.export.sendMailButton')).bind('click',function(){
    //        armylist.mailPrintList();
    //    }).appendTo(buttons);
    fillForUrl(listUrl);
    $('#rootContainer').hide();
    popup.show();
    utils.getTinyUrl({
        url:listUrl,
        success:function(newUrl){
            fillForUrl(newUrl);
            armylist.popupScroller.updateScroll();
        }
    });
    armylist.popupScroller.updateScroll(true);
};

armylist.popupScroller=utils.createScroll({
    getScrollWrapper:function(){
        return $('#genericPopupScrollWrapper');
    },
    getAvailableHeight:function(){
        return $(window).width()<=600?$(window).height():($(window).height()-100);
    //            -($('#campaignToolsContainer').outerHeight(true)-$('#campaignToolsScrollWrapper').height());
    },
    getAvailableWidth:function(){
        return $(window).width()<=600?$(window).width():500;
    //            -($('#campaignToolsContainer').outerWidth(true)-$('#campaignToolsScrollWrapper').width());
    },
    getExpectedHeight:function(){
        return $('#genericPopupContent').height();
    },
    getExpectedWidth:function(){
        return $('#genericPopupContent').width();
    },
    name:'popupScroller',
    iScrollConfig:{
        vScrollbar:true,
        hScrollbar:true
    }
});

plugins.registerPlugin('armylist.popupScroller',{
    onSizeOrLayoutChanged:function(){
        armylist.popupScroller.updateScroll();
    }
});
   
})();