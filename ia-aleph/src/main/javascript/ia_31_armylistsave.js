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
    
	log('loading 31: armylist load/save');
    
	//    if(storage.isPersistent){
        
	var savedListPrefix="savedList.",lastSavedListKey="lastSavedList";
	//        var savedLists=null;
	var deleteButtonPath='images/trash_icon.png';
		
	var lastSavedList;
	function getLastSavedList(){
		return lastSavedList || (lastSavedList=storage.get(lastSavedListKey));
	}
	
	var remoteJobActive=false;
	armyList.startSyncFromRemoteJob=function(remoteSyncTimeout){
		remoteSyncTimeout|=1000*60*10;
		if(remoteJobActive){
			return;
		}
		remoteJobActive=true;
		setTimeout(function executeSyncFromRemote(){
			armyList.syncFromRemote({
				skipLastSaved:true,
				skipUpload:true
			});
			setTimeout(executeSyncFromRemote,remoteSyncTimeout);
		},remoteSyncTimeout);
	};
		
	armyList.syncFromRemote=function(config){
		config=config||{};
		var autoLoadId=null;
		remote.listDataWithPrefix(savedListPrefix,function(data){
			var remoteListIdList={};
			$.each(data,function(listId,listDataInfo){
				var remoteTime=utils.parseDate(listDataInfo.dateMod);
				remoteTime=remoteTime?remoteTime.getTime():null;
				if(!remoteTime){
					log('unable to parse remote time : ',listDataInfo.dateMod);
					return;
				}
				var localData=loadList(listId),localTime=localData?utils.parseDate(localData.dateMod).getTime():null;
				remoteListIdList[listId]=localTime===null || localTime<=remoteTime;	
				if(localTime===null || localTime<remoteTime){
					if(listDataInfo.deleted){
						if(localData){
							deleteList(listId,true);
						}
					}else{
						log('retrieving remote list ',listId);
						remote.loadData(savedListPrefix+listId,function(list){
							if(list && list.listId && listId==list.listId){
								log('importing remote list ',listId);
								//TODO verify data
								storage.pack(savedListPrefix+list.listId,list);
								if(listId==armyList.listId || listId==autoLoadId){
									units.loadUnitsForList(list);
									armyList.importList(list);
								}
							}
						});
					}
				}
			});
			if(!config.skipUpload){
				$.each(getAllSavedLists(),function(listId,list){
					if(!remoteListIdList[listId]){
						remote.storeData(savedListPrefix+listId,list);	
					}
				});
			}
		});
		if(!config.skipLastSaved){
			remote.loadData(lastSavedListKey,function(data){
				var remoteListId=data.data;
				if(remoteListId && remoteListId!=lastSavedList){
					var list=loadList(remoteListId);
					if(list){
						units.loadUnitsForList(list);
						armyList.importList(list);
					}else{
						autoLoadId=remoteListId;
					}
					setCurrentListId(remoteListId,true);
				}
			});
		}
	};
       
	function setCurrentListId(listId,skipRemote){
		storage.set(lastSavedListKey,lastSavedList=listId);
		if(!skipRemote){
			remote.storeData(lastSavedListKey,lastSavedList);
		}
	}
	   
	function saveList(list){
		//            load();
		log('saving list ',list);
		//            var smallRecord=listToSmallRecord(list);
		//            savedLists[list.listId]=list.listId;
		//		lastSavedList=list.listId;
		
		try{
			setCurrentListId(list.listId);
			storage.pack(savedListPrefix+list.listId,list);
			//			storeLastSavedListId();
			remote.storeData(savedListPrefix+list.listId,list);
			return null;
		}catch(e){
			log('error saving list ',list);
			e.printStackTrace();
			return e;
		}
	}
	function loadList(id){
		try{
			var list=storage.unpack(savedListPrefix+id);
			if(list && list.id && !list.listId){
				list.listId=list.id;
			}
		}catch(e){
			log('error loading list for id ',id,' : ',e);
			return false;
		}
		return list;
	}
	function deleteList(id,skipRemote){
		//            delete savedLists[id];
		//            store();
		log('removing from storage list ',id);
		storage.remove(savedListPrefix+id);
		if(!skipRemote){
			remote.deleteData(savedListPrefix+id);
		}
	}
	function getAllSavedLists(){
		var data=storage.unpackAllWithPrefix(savedListPrefix);
		$.each(data,function(listId,list){
			if(!list || !list.listId || list.listId!=listId){
				delete data[listId];
				deleteList(listId);
			}
		});
		return data;
	}
        
	//        armyList.getSavedLists=getSavedLists;
	armyList.getSavedList=function(id){
		return armyList.listId==id?armyList.exportList():loadList(id);
	}
	armyList.getLastSavedList=function(){
		getLastSavedList();
		if(!lastSavedList){
			return null;
		}
		return loadList(lastSavedList);
	}
	armyList.saveList=function(){
		saveList(armyList.exportList());
	}
	armyList.newListId=function(){
		return armyList.listId=utils.newId();
	}
	armyList.newListId();
        
	armyList.showSavedListsWindow=function(){
		function backToMainView(){
			$('#rootContainer').show();
			savedListWindow.hide().empty();   
			armyList.savedListScroller=null;
		};            
		var savedListWindow=$('#savedLists');
		//            load();
		savedListWindow.empty();
		$('<div id="savedListsBackButton" />').text(messages.get('common.close'))
		.prepend($('<img class="buttonIcon"></img>').attr('src','images/delete_icon.png'))
		.bind('click',function(){
			backToMainView();
		}).appendTo(savedListWindow);
		var scrollWrapper=$('<div id="savedListsScrollWrapper" />').appendTo(savedListWindow);
		var table=$('<table />').appendTo(scrollWrapper);
		var header=$('<tr />').appendTo(table);
		$.each(['factionLogo','faction','name','pcap','modelCount','lastView','buttons'],function(x,label){
			$('<th />').text(messages.get('armylistsave.headerLabels.'+label)).appendTo(header);
		});
		var orderedLists=[];
		$.each(getAllSavedLists(),function(listId,listInfo){
			//                var listInfo=loadList(listId);
			if(listInfo && listInfo.models && listInfo.models.length==0 && listInfo.listId!=armyList.listId){ // cleanup empty lists
				deleteList(listId);
			}else if(listInfo){
				orderedLists.push(listInfo);
			}
		});
		orderedLists.sort(function(list1,list2){
			var d1=utils.parseDate(list1.dateMod),d2=utils.parseDate(list2.dateMod);
			if(d1 == d2){
				return 0
			}else if(d1===null || (d2!==null && d1 < d2)){
				return 1;
			}else{
				return -1;
			}
		});
		$.each(orderedLists,function(x,listInfo){
			try{
				var isCurrentList=listInfo.listId==armyList.listId;
				var savedListRow=$('<tr class="savedListRow" />');
				if(isCurrentList){
					savedListRow.addClass('currentList');
				}
				var factionOrSectorial=listInfo.sectorial?listInfo.sectorial:listInfo.faction;
				var factionOrSectorialDisplay=names.get('faction',factionOrSectorial);
				var iconPath=utils.buildImagePath(factionOrSectorial,"logo_small");
				$('<td />').html($('<img />').attr('src',iconPath)).appendTo(savedListRow);
				$('<td />').text(factionOrSectorialDisplay).appendTo(savedListRow);
				var name=listInfo.listName;
				var nameField=$('<td class="nameField"/>').text(name?name:messages.get('armylistsave.setName')).appendTo(savedListRow).editable(function(value){
					if(isCurrentList){
						armylist.setListName(value);
					}else{
						listInfo.listName=value;
						saveList(listInfo);
					}
					return value;
				});
				if(!name){
					nameField.addClass('missingName');
				}
				$('<td />').text(listInfo.pcap).appendTo(savedListRow);
				$('<td />').text(listInfo.models.length).appendTo(savedListRow);
				var lastMod=utils.parseDate(listInfo.dateMod),lastModText = lastMod ? lastMod.toLocaleString(messages.getLang()) : ('N/A');
				$('<td class="dateMod"/>').text(lastModText).appendTo(savedListRow);
				$('<td class="deleteButton"/>').html($('<img />').attr('src',deleteButtonPath).attr('title',messages.get('armylistsave.deleteListButton'))).bind('click',function(){
					deleteList(listInfo.listId);
					savedListRow.remove();
					savedListScroller.updateScroll();
				}).appendTo(savedListRow);
				$('td',savedListRow).not('.deleteButton , .nameField').bind('click',function(){
					var list=loadList(listInfo.listId);
					if(list){
						units.loadUnitsForList(list);
						armyList.importList(list); 
						setCurrentListId(list.listId);
						//						storage.set(lastSavedListKey,lastSavedList=list.listId);
						//						storage.set(lastSavedListKey,list.listId);  
						//						armyList.saveList(); // mark loaded list as last opened
						backToMainView();                   
					}
				});
				savedListRow.appendTo(table);
			}catch(e){
				log('error showing list ',listInfo,' : ',e);
			}
		});
		savedListWindow.show();
		$('#rootContainer').hide();
            
            
		var savedListScroller=armyList.savedListScroller=utils.createScroll({
			getScrollWrapper:function(){
				return $('#savedListsScrollWrapper');
			},
			getAvailableHeight:function(){
				return $(window).height()-$('#savedLists').outerHeight(true)+$('#savedListsScrollWrapper').outerHeight(false)-17;
			//                    return $(window).height()-40; // should be 38
			},
			getExpectedHeight:function(){
				return $('#savedListsScrollWrapper > *').outerHeight(false);
			},
			name:'savedListScroller'
		//                beforeEnable:function(){
		////                    $('#modelChooserContainerScrollWrapper .modelButton').draggable('disable');
		//                },
		//                afterDisable:function(){
		//                    $('#modelChooserContainerScrollWrapper .modelButton').draggable('enable');
		//                }
		});
		//            setTimeout(function () {
		savedListScroller.updateScroll();
            
		plugins.registerPlugin('savedListScroller',{
			onSizeOrLayoutChanged:function(){
				//                    if(savedListScroller){
				savedListScroller.updateScroll();
			//                    }
			}
		});
	//            },1000);
	//            units.updateScroll=savedListScroller.updateScroll;
	}
	//    }
    
	armyList.getFavouriteFactions=function(){
		var countForFaction={};
		$.each(savedLists,function(listId,x){
			var listInfo=loadList(listId);
			if(listInfo){
				var factionOrSectorial=listInfo.sectorial?listInfo.sectorial:listInfo.faction;
				countForFaction[factionOrSectorial]=(Number(countForFaction[factionOrSectorial])||0)+1;
			}
		});
		var list=[];
		$.each(countForFaction,function(faction,count){
			list.push({
				faction:faction,
				count:count
			});
		});
		list.sort(function(a,b){
			return b.count-a.count;
		});
		return list;
	};    
        
})();