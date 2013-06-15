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

(function(){
    
	//    var modelInfoButton=$('#modelInfoButton').text(messages.get('modelinfo.hideModelInfo')).bind('click',function(){
	//        $('#modelInfoContainer').toggleClass('hidden');
	//        if($('#modelInfoContainer').hasClass('hidden')){
	//            modelInfoButton.text(messages.get('modelinfo.showModelInfo'));
	//        }else{
	//            modelInfoButton.text(messages.get('modelinfo.hideModelInfo'));
	//        }
	//    });
	function showModelInfoContainer(){
		var cnt=$('#modelInfoContainer');
		cnt.hide('fast',function(){
			cnt.removeClass('hidden').show('fast',function(){
				cnt.css('display','');
				armylist.armylistScroller.updateScroll();
			});
		});
		config.set('modelInfoContainer.shouldShow',true);
	}
	function hideModelInfoContainer(){
		var cnt=$('#modelInfoContainer');
		cnt.hide('fast',function(){
			cnt.addClass('hidden').show('fast',function(){
				cnt.css('display','');
				armylist.armylistScroller.updateScroll();
			});
		});
		config.set('modelInfoContainer.shouldShow',false);
	}	
	//    $('#modelInfoContainer').bind('dblclick',function(){
	//        if(config.get('modelInfoContainer.shouldShow')){
	//            hideModelInfoContainer();
	//        }else{
	//            showModelInfoContainer();
	//        }
	//    });
	if(!config.get('modelInfoContainer.shouldShow')){
		$('#modelInfoContainer').addClass('hidden');
	}
	
	$('#modelInfoButton').text(messages.get('modelinfo.modelInfoTitle')).bind('click',function(){
		showModelInfoContainer();
	});
    
	// IMAGES SLIDESHOW
	$(window).resize(function(){
		imageContentWrapper.css({
			width:Math.min($(window).width(),1280),
			height:$(window).height()
		});
		imageScroll.refresh();
	});
	var imagePopup=$('#imagesPopup'),imageContentWrapper=$('#imagesPopupContentWrapper'),imageContent=$('#imagesPopupContent');
	$('#imagesPopupCloseButton',imagePopup).text(messages.get('common.close')).bind('click',function(){
		imagePopup.hide()
		$('#rootContainer').show();
		imageContent.empty();
	});
	var imageScroll=new iScroll(imageContentWrapper[0].id, {
		//        hScrollbar: false, 
		//        vScrollbar: false,
		zoom: true,
		bounce: false,
		lockDirection: false
	});
	function showImages(model){
		log('showing images for ',model);
		imageContent.empty();
		var maxWidth=0;
		imageContentWrapper.css({
			width:Math.min($(window).width(),1280),
			height:$(window).height()
		});
		$.each(model.parent.cbImages.imagesBig,function(index,url){
			$('<img />').attr('src',url).appendTo(imageContent).bind('load',function(){
				maxWidth=Math.max(maxWidth,$(this).width());
				imageContent.css({
					width:maxWidth+20
				});
				setTimeout(function(){
					imageScroll.refresh();    
				},0);            
			});
		});
		imagePopup.show();
		$('#rootContainer').hide();
		setTimeout(function(){
			imageScroll.refresh();
		},0);
	}
	// END IMAGES SLIDESHOW
	
	//    $('#modelInfoContainer').attr('title',messages.get('common.clickToHide'));
    
	// BEGIN unit info display
	//	var modelInfoContainerByIscCode={};
	var showModelInfo=function(model){
		//		var key=model.parent.isc+'-'+model.code;
		//		var modelInfo=modelInfoContainerByIscCode[key];
		$('#modelInfoContainer .modelInfo').remove();
		//		$('#modelInfoContainer .modelInfo').addClass('hidden');
		//		if(!modelInfo){
		var	modelInfo=buildModelInfo(model);
		//			modelInfoContainerByIscCode[key]=modelInfo;
		modelInfo.appendTo('#modelInfoContainer');
		//		}else{
		//			modelInfo.removeClass('hidden');
		//		}
		weapons.showWeaponsForModel(model);
		armylist.armylistScroller.updateScroll();
	}
	function buildModelInfo(model){
		var modelInfo=$('<div  class="modelInfo showDefault"/>').attr('title',messages.get('common.clickToHide'));
		var head=$('<div class="modelInfoHead" />').appendTo(modelInfo);
		var icon=$('<div class="modelInfoIcon" />').appendTo(head).attr('title',messages.get('modelinfo.showImages')).bind('click',function(){
			showImages(model);
			return false;
		});
		$.each(model.parent.cbImages.icon,function(index,url){
			$('<img />').attr('src',url).hide().appendTo(icon);
		});
		$('img:first-child',icon).show();
		if(model.parent.cbImages.icon.length==0){
			$('<img />').attr('src',"images/missing_logo_big.png").appendTo(icon);
		}		
		//        if(model.parent.cbImages.icon.length>1){
		icon.cycle({
			//                fit:true
			});
		//        }
		var namesDiv=$('<div class="modelInfoNames" />').appendTo(head);
		$('<div class="modelInfoName" />').text(model.getDisplay('name')).appendTo(namesDiv);
		$('<div class="modelInfoCode" />').text(model.getDisplay('codename')).appendTo(namesDiv);
		//        var modelInfoAltName= $('<div class="modelInfoAltName" />').appendTo(namesDiv);
		var left=$('<div class="modelInfoLeft" />').appendTo(head);
		$('<div class="modelInfoCost" />').text(model.cost).appendTo(left);
		$('<div class="modelInfoType" />').text(model.parent.type).appendTo(left);
		$('<div class="modelInfoSwc" />').text(model.swc).appendTo(left);
		var statsTable=$('<table class="modelInfoAttrs" />').appendTo(modelInfo);
		//        var stats=["mov","cc","bs","ph","wip","arm","bts","w","ava"];
		var stats=["mov","cc","bs","ph","wip","arm","bts","w"];
		var header=$('<tr class="modelInfoHeader"/>').appendTo(statsTable);
		var row=$('<tr  class="modelInfoValues modelInfoDefault"/>').appendTo(statsTable);
         
		$('<tr class="modelInfoSpecs modelInfoDefault "/>').appendTo(statsTable)
		.append($('<td />').attr('colspan',stats.length).text(model.getAllSpecDisplay()));
        
		var extraRows=[],i,altp=model.get('altp'),altpc=altp?altp.length:0;
		for(i=0;i<altpc;i++){
			$('<tr class="modelInfoAltpNames" />').addClass('modelInfoAltp'+i).appendTo(statsTable)
			.append($('<td  class="modelInfoAltpName" />').attr('colspan',stats.length-2).text(altp[i].getDisplay('isc')))
			.append($('<td />').attr('colspan',2).text(altp[i].getDisplay('type')));
			extraRows.push($('<tr class="modelInfoAltpValues" />').addClass('modelInfoAltp'+i).appendTo(statsTable));
			$('<tr class="modelInfoSpecs "/>').addClass('modelInfoAltp'+i).appendTo(statsTable)
			.append($('<td />').attr('colspan',stats.length).text(altp[i].getDisplay('spec')));
		//            $('<div />').addClass('modelInfoAltp'+i).text(altp[i].getDisplay('isc')).appendTo(modelInfoAltName);            
		}
		$.each(stats,function(index,attr){
			//                    $('<th />').text(messages.get('units.attribute.'+attr)).appendTo(header);
			$('<th />').text(messages.get('units.attribute.'+(attr=='w'?model.getWoundType():attr))).appendTo(header);
			$('<td />').addClass(attr+'Attr').text(model.get(attr)).appendTo(row);
			for(i=0;i<altpc;i++){
				$('<td />').addClass(attr+'Attr').text(altp[i].get(attr)).appendTo(extraRows[i]);
			}
		});
		names.createCmAttrForMov(statsTable);
		//        var modelInfoSpecsWrapper=$('<div class="modelInfoSpecsWrapper" />').appendTo(modelInfo);
		//        $('<div class="modelInfoSpecs modelInfoDefault" />').text(model.getAllSpecDisplay()).appendTo(modelInfoSpecsWrapper);
        
		//        for(i=0;i<altpc;i++){
		//            $('<div  class="modelInfoSpecs "/>').addClass('modelInfoAltp'+i).text(altp[i].getAllSpecDisplay()).appendTo(modelInfoSpecsWrapper);
		//        }
		//        if(altpc){
		//            //            $('<div class="modelInfoAltpButton" />').append($('<img />').attr('src','images/swapaltp_icon.png').attr('title',messages.get('modelinfo.buttons.swapAltp'))).bind('click',function(){
		//            modelInfo.bind('click',function(){         
		//                modelInfo.toggleClass('showDefault').toggleClass('showAltp0');
		//                armyList.updateScroll();
		//                return false;
		//            //            }).appendTo(modelInfo);
		//            });
		//        }
        
		modelInfo.bind('click',function(){
			hideModelInfoContainer();
		});
		//        var bsw=model.getDisplay('bsw'),ccw=model.getDisplay('ccw'),weapons=bsw+((bsw.length>0||ccw.length>0)?', ':'')+ccw;
		//        $('<div class="modelInfoWeapons" />').text(weapons).appendTo(modelInfo);
		return modelInfo;
	}
	// END unit info display
    
	units.showModelInfo=showModelInfo;
	units.clearModelInfo=function(){
		$('#modelInfoContainer .modelInfo').remove();
		modelInfoContainerByIscCode={};
	}
})();