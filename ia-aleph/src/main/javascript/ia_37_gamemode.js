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

var game=ia.game={};

(function(){
    
	var gameModeEnabled=false;
	var photoIconsByRecordId={},currentGame=storage.unpack('game.gameModeStatus');
    
	var unconsciousIcon=$('<img class="gamePhotoToken unconsciousToken" src="images/unconscious_token_icon.png" title="Unconscious" ></img>');
	function clearCurrentGame(){
		currentGame={
			inactiveModelsByRecordId:{
                
			},
			photoIconsById:{
                            
			},
			gamePhoto:'images/default_game_photo.jpg'
		};
		clearPhotoIcons();
		saveGameStatus();
		$('#gamePhotoOverlay .photoModelIcon').remove();
	}
	if(!currentGame || !currentGame.inactiveModelsByRecordId || !currentGame.photoIconsById || !currentGame.gamePhoto ){
		clearCurrentGame();
	}
    
	//    function resizeImage(url, width, height, callback) {
	//        var sourceImage = new Image();
	//        sourceImage.onload = function() {
	//            try{
	//                var canvas = document.createElement("canvas");
	//                canvas.width = width;
	//                canvas.height = height;
	//                canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);
	//                callback(canvas.toDataURL());
	//            }catch(e){
	//                log(e);
	//                callback(url);
	//            }
	//        }
	//        sourceImage.src = url;
	//    }
	function setGamePhoto(gamePhoto){
		currentGame.gamePhoto=gamePhoto;
		clearPhotoIcons();
		buildGameControlScreen();
	}
	if(device.hasCordova()){
		$('#gamePhotoCameraButton').bind('touchstart',function(){
			log('invoking camera');
			//navigator.camera.getPicture( cameraSuccess, cameraError, [ cameraOptions ] );
			navigator.camera.getPicture(function(imageData){
				setGamePhoto( "data:image/jpeg;base64," + imageData);
			});
		});
	}
	$('#photoFileInput').bind('change',function(event){
		var file=event.originalEvent.target.files[0];
		log('loading image from file : ',file,' event : ',event);
		var reader = new FileReader();
		reader.onload=function(){
			setGamePhoto(reader.result);
		};
		reader.readAsDataURL(file);
	});
        
	game.isEnabled=game.isGameModeEnabled=function(){
		return gameModeEnabled;
	};
        
	game.enableGameMode=function(){
		$('#rootContainer').addClass('gameMode');
		gameModeEnabled=true;
		config.set('game.gameModeEnabled',true);
		plugins.onSizeOrLayoutChanged();
		buildGameControlScreen();
	};
	game.disableGameMode=function(){
		$('#rootContainer').removeClass('gameMode');
		clearCurrentGame();
		updateGameControlScreen();
		gameModeEnabled=false;
		config.set('game.gameModeEnabled',false);
		plugins.onSizeOrLayoutChanged();
	};
    
	plugins.registerPlugin('gameModeMainPlugin',{
		afterAppLoading:function(){
			if(config.get('game.gameModeEnabled')){
				$.each(currentGame.photoIconsById,function(recordId,photoIconData){
					addPhotoIcon(recordId,photoIconData.position);
				});
				game.enableGameMode();
			}
			plugins.registerPlugin('gameModeMainPlugin',{
				armylistCleanup:function(){
					game.disableGameMode();
				}
			});
		}
	});
    
        
	var gameModeContainer=$('#gameModeContainer');
	$('.remainingOrders',gameModeContainer).before(messages.get('game.remainingOrders'));
	$('.remainingPoints',gameModeContainer).before(messages.get('game.remainingPoints'));
	$('.lossPercentage',gameModeContainer).before(messages.get('game.lossPercentage'));
        
	function clearPhotoIcons(){
		photoIconsByRecordId={};
		currentGame.photoIconsById={};
		$('#gamePhotoOverlay .photoModelIcon').remove();
	}
	function loadGamePhoto(){
		$('#gamePhoto').attr('src',currentGame.gamePhoto).bind('load',function(){
			$('#gamePhotoScrollContent').css({
				width:$(this).width(),
				height:$(this).height()
			});
			gamePhotoScroll.updateScroll();
		});
	}
	function buildGameControlScreen(){
		loadGamePhoto();
		updateGameControlScreen();
	}
    
	function updateGameControlScreen(){
		var warningsContainer=$('.warnings',gameModeContainer).empty();
		var modelList=armylist.getListRecordsAsList();
		var remainingOrders=0,remainingPoints=0,pointLoss=0,totalPoints,hasMorat=false,allReligious=true;
		$.each(modelList,function(x,listRecord){
			var components=listRecord.row;
			if(photoIconsByRecordId[listRecord.id]){
				components=components.add(photoIconsByRecordId[listRecord.id]);
			}
			var isBaggage=listRecord.model.get('spec')['Baggage']?true:false;
			var modelValue=(Number(listRecord.model.get('cost'))||0)+(isBaggage?20:0);
			if(!currentGame.inactiveModelsByRecordId[listRecord.id]){
				remainingPoints+=modelValue; //todo check for baggage, shasvastii, etc
				remainingOrders+=listRecord.model.parent.isPseudoUnit?0:1; //todo better check
				components.removeClass('deadModel');
			}else{
				components.addClass('deadModel');
				pointLoss+=modelValue;
			}
			if(!hasMorat && listRecord.model.get('spec')['Morat']){
				hasMorat=true;
			}
			if(allReligious && !listRecord.model.get('spec')['Religious Troop']){
				allReligious=false;
			}
		});
		totalPoints=pointLoss+remainingPoints;
		var lossPercentage=pointLoss/totalPoints*100;
		$('.remainingOrders',gameModeContainer).text(remainingOrders);
		$('.remainingPoints',gameModeContainer).text(remainingPoints+' / '+totalPoints);
		$('.lossPercentage',gameModeContainer).text(Math.round(lossPercentage)+' %');
		var retreatThreshold=hasMorat?75:60;
		if(!allReligious && lossPercentage>retreatThreshold){
			$('<div class="warning"/>').text(messages.get('game.retreatWarning')).appendTo(warningsContainer);
		}
		storage.pack('game.gameModeStatus',currentGame);
		gamePhotoScroll.updateScroll();
	}
    
	var armyListControls=$('#armyListGameModeControls');
	$('<div class="armyListControlButton addPhotoIconControlButton" />').attr('title',messages.get('game.buttons.addPhotoIcon')).bind('click',function(){
		addPhotoIcon(armylist.getSelectedRecord().id);
		menu.switchMode('unitSelectionMode')
		updateGameControlScreen();        
	})
	.append($('<img class="armyListControlButtonIcon" />').attr('src','images/photo_icon.png'))
	.appendTo(armyListControls);
	$('<div class="armyListControlButton activeControlButton" />').attr('title',messages.get('game.buttons.active')).bind('click',function(){
		var record=armylist.getSelectedRecord();
		delete currentGame.inactiveModelsByRecordId[record.id];
		armyListControls.removeClass('inactiveModelSelected');  
		updateGameControlScreen();
	})
	.append($('<img class="armyListControlButtonIcon" />').attr('src','images/disabled_icon.png'))
	.appendTo(armyListControls);
	$('<div class="armyListControlButton inactiveControlButton" />').attr('title',messages.get('game.buttons.dead')).bind('click',function(){
		var record=armylist.getSelectedRecord();
		currentGame.inactiveModelsByRecordId[record.id]=record.id;
		armyListControls.addClass('inactiveModelSelected');
		updateGameControlScreen();
	})
	.append($('<img class="armyListControlButtonIcon" />').attr('src','images/enabled_icon.png'))
	.appendTo(armyListControls);
    
	plugins.registerPlugin('gameModeRecordSelectionPlugin',{
		armylistRecordSelected:function(record){
			if(currentGame.inactiveModelsByRecordId[record.id]){
				armyListControls.addClass('inactiveModelSelected');
			}else{
				armyListControls.removeClass('inactiveModelSelected');                
			}
			$('.photoModelIcon').removeClass('selected');
			if(photoIconsByRecordId[record.id]){
				photoIconsByRecordId[record.id].addClass('selected');
			}
		}
	});
	
	
	var gamePhotoScroll=utils.createScroll({
		getScrollWrapper:function(){
			return   $('#gamePhotoScrollWrapper');
		},
		getAvailableHeight:function(windowWidth,windowHeight){
			//            return $(window).height()-$('#modelInfoContainer').outerHeight(true)-21;
			return windowWidth>750
			?(windowHeight-$('#topBar').outerHeight(true)-$('#gameModeContainer .listStatus').height()-30)
			:(windowHeight-$('#topBar').outerHeight(true)-$('#gameModeContainer .listStatus').height()-12);
		//                -($('#armyList .listInfo').css('display')=="none"?0:$('#armyList .listInfo').outerHeight(true)+$('#armyList .warningsBar').outerHeight(true));
		},
		getExpectedHeight:function(){
			return $('#gamePhotoScrollContent img').height();
		},
		getAvailableWidth:function(windowWidth,windowHeight){
			//            return $(window).height()-$('#modelInfoContainer').outerHeight(true)-21;
			return  windowWidth>750?(windowWidth-25-$('#rightContainer').outerWidth(true)):(windowWidth-24);//todo handle landscape mode
		//                -($('#armyList .listInfo').css('display')=="none"?0:$('#armyList .listInfo').outerHeight(true)+$('#armyList .warningsBar').outerHeight(true));
		},
		getExpectedWidth:function(){
			return $('#gamePhotoScrollContent img').width();
		},
		name:'gamePhotoScroll',
		iScrollConfig:{
			lockDirection:false,
			hScroll:true,
			vScroll:true,
			vScrollbar:true,
			hScrollbar:true
		}
	});
	plugins.registerPlugin('gamePhotoScroller',{
		onSizeOrLayoutChanged:function(){
			//            if(armylistScroll){
			gamePhotoScroll.updateScroll();
		//            }
		}
	});
	
	$('#gamePhotoOverlay').bind('click mousedown touchstart',function(e){
		//		if(!($(e.currentTarget).attr('id')=='gamePhotoOverlay')){
		if(e.target!=this){
			return false; //stop touch events started on items
		}
	});
	
	function addPhotoIcon(recordId,position){
		function getPosition(element){
			return {
				top:element.css('top'),
				left:element.css('left')
			};
		}
		function savePosition(recordId){
			var photoIcon=photoIconsByRecordId[recordId],position=getPosition(photoIcon);
			//log('photoIcon update position ',recordId,' : ',position);
			currentGame.photoIconsById[recordId]={
				position:position
			};
		}
		if(!position){
			position={
				top:$('#gamePhoto').height()/2 || 50,
				left:$('#gamePhoto').width()/2 || 50
			}
		}
		var record=armylist.listRecordsById[recordId],item=record.row;
		if(photoIconsByRecordId[recordId]){
			photoIconsByRecordId[recordId].css(position);
		}else{
			photoIconsByRecordId[recordId]=$('<div />').html($('.modelIcon',item).html())
			.attr('class',item.attr('class')||'').removeClass('armyListModelRow')
			.addClass('photoModelIcon').css(position).appendTo('#gamePhotoOverlay')
			.draggable({
				drag:function(event,ui){
					savePosition(recordId);
					saveGameStatus();
				}
			}).bind('click',function(){
				record.row.trigger('click');
			}).attr('title',record.model.getDisplay('name')+' '+record.model.getDisplay('codename'))
			.append(unconsciousIcon.clone());
		}
		savePosition(recordId);
		saveGameStatus();
	}
        
	function saveGameStatus(){
		storage.pack('game.gameModeStatus',currentGame);
	}
	
	$('#gamePhotoScrollContent').droppable({
		drop:function(event,ui){
			var item=ui.draggable,recordId=$('.recordId',item).text();
			if(item.hasClass('photoModelIcon')){
				return;
			}else {
				var containerOffset=$('#gamePhotoOverlay').offset();
				addPhotoIcon(recordId,{
					left:ui.offset.left-containerOffset.left,
					top:ui.offset.top-containerOffset.top
				});
				saveGameStatus();
			}
		}
	});
    
})();