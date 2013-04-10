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

var armylist,armyList=armylist=ia.armyList=ia.armylist={};

(function(){
    
    log('loading 27: armylist core');
    
    $('#topBar .modelCount').before(messages.get('armylist.listinfo.modelCount')+': ');
    $('#topBar .pointsCount').before(messages.get('armylist.listinfo.pointsCount')+': ');
    $('#topBar .swcCount').before(messages.get('armylist.listinfo.swcCount')+': ');
	
    $('#armyList .modelCount').after(' '+messages.get('armylist.listinfo.modelCount')+", "+messages.get('armylist.listinfo.total')+": ");
    $('#armyList .secondRow .label').text(messages.get('armylist.listinfo.max')+": ");
    $('#armyList .thirdRow .label').text(messages.get('armylist.listinfo.remaining')+": ");
    
    $('<div class="armylistNameField"/>').appendTo('#topBar .listInfo');
    $('<div class="armylistNameField"/>').appendTo($('<div class="fourthRow" />').appendTo('#armyList .listInfo'));
    $('.armylistNameField').editable(function(value){
        armylist.setListName(value);
        return value;
    });
    armylist.setListName=function(newName,skipSave){
        armylist.listName=newName;
        if(!skipSave){
            armylist.saveList();
        }
        showListName();
    };
	armylist.getListName=function(){
		return armylist.listName||'';
	};
    function showListName(){
        $('#topBar .armylistNameField , #armyList .armylistNameField').text(armylist.listName||messages.get('armylistsave.setName'));
    }
    showListName();
    
    plugins.registerMethod('armylistRecordSelected',{discardResult:true});
    plugins.registerMethod('armylistRecordDeselected',{discardResult:true});
    plugins.registerMethod('armylistCleanup',{discardResult:true});
    
    var armyListControls=$('#armyListControls');
    $('<div class="moveUpButton armyListControlButton" />').attr('title',messages.get('armylist.buttons.moveUpButton')).bind('click',function(){
        if(armyList.modelCount<2){
            return;
        }
        var record=getSelectedRecord();
        var next=record.row.prevAll('.armyListModelRow , .groupBar').not('.groupBar1').first();
        if(next[0]){
            next.before(record.row);
        }else{
            $('#armyList .armyListModelRow , #armyList .groupBar').last().after(record.row);
        }
        afterPositionChange();	   
    })
    .append($('<img  class="armyListControlButtonIcon" />').attr('src','images/up_icon.png'))
    .appendTo(armyListControls);
    $('<div class="moveDownButton armyListControlButton" />').attr('title',messages.get('armylist.buttons.moveDownButton')).bind('click',function(){
        if(armyList.modelCount<2){
            return;
        }
        var record=getSelectedRecord();
        var next=record.row.nextAll('.armyListModelRow , .groupBar').first();
        if(next[0]){
            next.after(record.row);
        }else{
            $('#armyList .armyListModelRow , #armyList .groupBar').not('.groupBar1').first().before(record.row);
        }
        afterPositionChange();	   
    })
    .append($('<img  class="armyListControlButtonIcon" />').attr('src','images/down_icon.png'))
    .appendTo(armyListControls);
    var swapGroupButton=$('<div class="swapGroupButton armyListControlButton" />').attr('title',messages.get('armylist.buttons.swapGroupButton')).bind('click',function(){
        var record=getSelectedRecord();
        if(record && groupMarksCount > 1){
            var next=record.row.nextAll('.groupBar');
            (next[0]?next:$('#armyList .groupBar')).first().nextUntil('.groupBar').last().after(record.row);
            afterPositionChange();	   
        }
    })
    .append($('<img  class="armyListControlButtonIcon" />').attr('src','images/swapgroup_icon.png'))
    .appendTo(armyListControls);
    var removeModelButton=$('<div class="removeModelButton armyListControlButton" />').attr('title',messages.get('armylist.buttons.removeModelButton')).bind('click',function(){
        var record=getSelectedRecord();
        if(record){
            removeRecord(record);
            //            armyListControls.hide();
            plugins.armylistRecordDeselected(record);
        }
    })
    .append($('<img  class="armyListControlButtonIcon" />').attr('src','images/trash_icon.png'))
    .appendTo(armyListControls);
    plugins.registerPlugin('armylistRecordSelection',{
        armylistRecordDeselected:function(){
            $('#rootContainer').removeClass('armylistRecordSelected');
        },
        armylistRecordSelected:function(){
            $('#rootContainer').addClass('armylistRecordSelected');
        }
    });
               
    function afterPositionChange(){
        validateList();
        armyList.saveList();
    }
    //    (function(){
        
    // SORTABLE
    //        var isOut=false;
    var armyListTable=$('#armyList table tbody');
    armyListTable.sortable({
        cancel:'.groupBar1 , .synchronizedUnit', // do not move first group bar, and synchronized units
        //        delay: 150,
        //            update:function(){
        //                //                if(!isOut){
        //                validateList();
        //                armyList.saveList();			
        //                //                }
        //            },
        //            out:function(){
        //                log('moved out : ',arguments);
        //                isOut=true;
        //            },
        //            over:function(){
        //                log('moved in : ',arguments);
        //                isOut=false;
        //            },
        //        start:function(){
        //            disableArmylistScroll();
        //        },
        //        handle:'.groupBarTitle , .modelIcon',
        stop:function(e){
            var armyListPosition=$('#armyList').offset();
            log('move stop : ',arguments,' ( relative to ',armyListPosition,' )');
            //                var armyListPosition=$('#armyList').offset(),armyListHeight=$('#armyList').height();
            var isOut=e.pageX<armyListPosition.left || e.pageY < armyListPosition.top;
            //                var isOut=e.pageX<armyListPosition.left || e.pageY < armyListPosition.top || e.pageY > armyListPosition.top+armyListHeight;
            if(isOut){
                //                    log('stopped out');
                //                    var targetEle=$(e.srcElement).parents('.armyListModelRow').find('.recordId');
                //                    var recordId=Number($('.recordId',targetEle).text());
                //                    var record=listRecordsById[recordId];
                //log('removing record : ',record);    
                if(!game.isGameModeEnabled()){
                    removeRecord(listRecordsById[$(e.srcElement||e.originalTarget).parents('.armyListModelRow').andSelf().find('.recordId').first().text()]);
                }
                //                    isOut=false;
            }else{
                afterPositionChange();	                    
            }
        }
    });
    // END SORTABLE
    
    // SCROLLABLE
    var armylistScroll=utils.createScroll({
        getScrollWrapper:function(){
            return   $('#armyListScrollWrapper');
        },
        getAvailableHeight:function(){
            //            return $(window).height()-$('#modelInfoContainer').outerHeight(true)-21;
            return $(window).height()
            //                -($('#modelInfoContainer').css('display')=="none"?0:$('#modelInfoContainer').outerHeight(true)+13)
                -($('#modelInfoContainer').css('display')=="none"?0:$('#modelInfoContainer').outerHeight(true))
                -($('#armyList').outerHeight(true)-$('#armyListScrollWrapper').outerHeight(true))
                -($('#weaponsInfo').css('display')=="none"?0:$('#weaponsInfo').outerHeight(true))
                -($(window).width()>$(window).height()||$('#smallScreenTopBar').css('display')=="none"?0:$('#smallScreenTopBar').outerHeight(true))
                +1;
            //                -($('#armyList .listInfo').css('display')=="none"?0:$('#armyList .listInfo').outerHeight(true)+$('#armyList .warningsBar').outerHeight(true));
        },
        getExpectedHeight:function(){
            return $('#armyListScrollWrapper > *').outerHeight(false);
        },
        name:'armylistScroll',
        beforeEnable:function(){
            armyListTable.sortable('disable');
        },
        afterDisable:function(){
            armyListTable.sortable('enable');
        }
    });
    armylist.armylistScroller=armylistScroll;
    plugins.registerPlugin('armylistScroller',{
        onSizeOrLayoutChanged:function(){
            //            if(armylistScroll){
            armylistScroll.updateScroll();
            //            }
        }
    });
    // END SCROLLABLE
    
    $('.pointsCount , .swcCount').bind('mousewheel',function(e,delta){
        log('mousewheel ',arguments);
        var newCap=(delta||(e.originalEvent.wheelDelta>0?1:-1))*50+armyList.pointCap;
        if(newCap>500){
            newCap=50;
        }else if(newCap<50){
            newCap=500;
        }
        setPointCap(newCap);
        armyList.saveList();
        return false;
    }).bind('click',function(){
        var cap=armyList.pointCap;
        if(cap<300){
            cap+=50;
        }else{
            cap=100;
        }
        setPointCap(cap);
        armyList.saveList();
        return false;
    });
    armyList.addWarning=function(listRecords){
        $.each(listRecords,function(index,listRecord){                    
            listRecord.row.addClass('warning');
        });
    };
	
    //	var models=armyList.models=[];
    var idSequence=0;
    var listRecordsById=armyList.listRecordsById={};
    function newListRecord(recordId){
        var record={
            id : recordId||utils.newId()
        };
        listRecordsById[record.id]=record;
        return record;
    }
    var clear=armyList.clear=function(){
        plugins.armylistRecordDeselected();
        plugins.armylistCleanup();
        listRecordsById=armyList.listRecordsById={};
        armylist.setListName('',true);
        armyList.newListId();
        $('#armyList .armyListModelRow').remove();
        $('#genericPopup').hide();
        validateList();
    };
	
    var setPointCap=armyList.setPointCap=function(pointCap){
        armyList.pointCap=pointCap;
        armyList.swcCap=Math.floor(pointCap/50);
        validateList();
    }
    armyList.getPointCap=function(){
        return armyList.pointCap;
    }
    armyList.getEffectivePointCap=function(){
        return armyList.pointCap+(plugins.getPointIncrement?plugins.getPointIncrement():0);
    }
    armyList.getEffectiveSwcCap=function(){
        return armyList.swcCap+(plugins.getSwcIncrement?plugins.getSwcIncrement():0);
    }
    plugins.configureMethod('armylistValidate');
    var validateList=armyList.validateList=function(){
        $('.listInfo .warning , .warningsBar .warning , #armyList .armyListModelRow.warning').removeClass('warning');
        armyList.pointCount=0;
        armyList.swcCount=0;
        armyList.modelCount=0;
        var starModels=[];
        var warnings=armyList.warnings=[];
        var avaCount=armyList.listRecordsByIsc={};
        var unitsByIsc=armyList.unitsByIsc={};
        var ltRecords=[];
        var needHackerOrTag=false,needHackerOrTagOrMnemonica=false,hasHacker=false,hasMnemonica=false,hasTag=false;
        function countAva(record,isc){
            if(avaCount[isc]){
                avaCount[isc].push(record);
            }else{
                avaCount[isc]=[record];
            }
        }
        $.each(listRecordsById,function(listRecordId,listRecord){
            var model=listRecord.model;
            unitsByIsc[model.parent.isc]=model.parent;
            armyList.pointCount+=Number(model.cost);
            armyList.swcCount+=Number(model.swc);
            if(!model.shouldSkipModelCount){
                armyList.modelCount++;
            }
            if(model.get('spec')['Control Device']){ //antipode control device, include antipodes and counts as double
                armyList.modelCount++;
            }
            if(model.parent.type=='REM' &&(!model.spec['AI Beacon'] && !model.spec['G: Synchronized'] && !model.spec['G: Servant']&& !(model.parent.isc=='Traktor Mul, Artillery and Support Regiment'))){
                if(model.spec['G: Autotool']){
                    needHackerOrTagOrMnemonica=true;
                }else{
                    needHackerOrTag=true;
                }
            }
            if(model.spec['Hacker']){
                hasHacker=true;
            }
            if(model.parent.type=='TAG'){
                hasTag=true;
            }
            if(model.spec['G: Mnemonica']){
                hasMnemonica=true;
            }
            if(model.get('ava')=='*'){
                starModels.push(listRecord);
            }
            countAva(listRecord,model.parent.isc);
            if(model.parent.sharedAva){
                countAva(listRecord,model.parent.sharedAva);
            }
            if(model.spec['Lieutenant']){
                ltRecords.push(listRecord);
            }
            if(model.isSynchronizedUnit && listRecord.parentRecord){
                if(listRecord.row.prev()[0]!=listRecord.parentRecord.row[0]){
                    listRecord.row.insertAfter(listRecord.parentRecord.row);
                }
            }
        });
        if(needHackerOrTag && !(hasHacker || hasTag)){
            warnings.push(messages.get('armylist.warning.remWarning'));
        }
        if(needHackerOrTagOrMnemonica && !(hasHacker || hasTag || hasMnemonica)){
            warnings.push(messages.get('armylist.warning.remAutotWarning'));
        }
        if(armyList.pointCount>armyList.getEffectivePointCap()){
            warnings.push(messages.get('armylist.warning.tooManyPoints')+' ('+armyList.pointCount+'/'+armyList.getEffectivePointCap()+')');
            $('.pointsCount').addClass('warning');
        }
        if(armyList.swcCount>armyList.getEffectiveSwcCap()){
            warnings.push(messages.get('armylist.warning.tooManySwc')+' ('+armyList.swcCount+'/'+armyList.getEffectiveSwcCap()+')');
            $('.swcCount').addClass('warning');
        }
        $.each(avaCount,function(isc,listRecords){
            if( (listRecords[0].model.parent.sharedAva && listRecords[0].model.parent.sharedAva!=isc) || (listRecords[0].model.parent.ava=='*')){
                return;
            }
            var count=listRecords.length,ava=Number(listRecords[0].model.parent.get('ava'));
            if(count>ava){
                warnings.push(messages.get('armylist.warning.tooManyModels')+' '+names.get('isc',isc)+' ('+count+'/'+ava+')');
                armyList.addWarning(listRecords);
            }
        });
        if(starModels.length>0){
            var starAva=Math.floor(armyList.pointCap/200);
            if(starModels.length>starAva){
                warnings.push(messages.get('armylist.warning.tooManyStarModels')+' ('+starModels.length+'/'+starAva+')');
                armyList.addWarning(starModels);
            }
        }
        if(ltRecords.length!=1){
            warnings.push(messages.get('armylist.warning.ltMiscount'));
            armyList.addWarning(ltRecords);
        }
        //        $.each(armyList.validations||[],function(i,validation){
        //            validation.call(armyList);
        //        });
        plugins.armylistValidate(armyList);
        $('#armyList .armyListSpacer').appendTo('#armyList tbody');
        checkGroupMarks();
        if(groupMarksCount>0){
            (function(){
                var groupMarks=getGroupMarks(),last=0,over=false,recordList=getListRecordsAsList(),lastModelCountBatch;
                function countModelsBetween(from,to){
                    var res=0,i;
                    lastModelCountBatch=[];
                    for(i=from;i<=to;i++){
                        var listrecord=recordList[i];
                        lastModelCountBatch.push(listrecord);
                        if(!listrecord.model.shouldSkipModelCount){
                            res++;
                        }
                        if(listrecord.model.get('spec')['Control Device']){ //antipode control device, include antipodes and counts as double
                            res++;
                        }
                    }
                    return res;
                }
                var i;
                for(i=0;i<groupMarks.length;i++){
                    var from=groupMarks[i],to=groupMarks[i+1]?(groupMarks[i+1]-1):(recordList.length-1);
                    var modelCount=countModelsBetween(from,to);
                    log('counted group ',i+1,' = ',modelCount,' ( ',lastModelCountBatch,' )');
                    if(modelCount>armyList.combatGroupSize){
                        over=true;
                        armyList.addWarning(lastModelCountBatch);
                    }
                }
                if(over){
                    warnings.push(messages.get('armylist.warning.tooBigCGroup')+' ('+armyList.combatGroupSize+')');
                }
            })();
            
            swapGroupButton.show();
        }else{
            swapGroupButton.hide();
        }
        //armyList.warnings=warnings;
        drawListSummary();
        plugins.onSizeOrLayoutChanged();
    }
    function drawListSummary(){
        var effectivePointCap=armyList.getEffectivePointCap(),
        effectiveSwcCap=armyList.getEffectiveSwcCap();
        $('.pointsCount .count').text(armyList.pointCount);
        $('.pointsCount .max').text(effectivePointCap);
        $('.pointsCount .diff').text(effectivePointCap-armyList.pointCount);
        $('.swcCount .count').text(armyList.swcCount);
        $('.swcCount .max').text(effectiveSwcCap);
        $('.swcCount .diff').text(effectiveSwcCap-armyList.swcCount);
        $('.modelCount').text(armyList.modelCount);
        $('#topBar .warnings , #armyList .warnings').html('');
        $.each(armyList.warnings,function(i,warning){
            $('<div />').text(warning).appendTo('#topBar .warnings').clone().appendTo('#armyList .warnings');
        });
    }
    
    function popRecord(listRecord){
        log('removing record ',listRecord);
        listRecord.row.remove();
        delete listRecordsById[listRecord.id];
    }
    function pushModel(model,replaceThis,recordId){
        var listRecord=newListRecord(recordId);
        listRecord.model=model;
        addRecordToView(listRecord,replaceThis);
        return listRecord;
    }
    function pushModelAndCompanions(model,replaceThis,recordId){
        var listRecord=pushModel(model,replaceThis,recordId);
        var i=0;
        $.each(model.getCompanions(),function(index,companion){
            var companionRecord=pushModel(companion,$('<div />').insertAfter(listRecord.row),listRecord.id+'_'+(++i));
            companionRecord.parentRecord=listRecord;
            if(!listRecord.companionRecords){
                listRecord.companionRecords=[companionRecord];
            }else{
                listRecord.companionRecords.push(companionRecord);
            }
        });
        return listRecord;
    }
    
    function insertModel(model,replaceThis){
        var listRecord=pushModelAndCompanions(model,replaceThis);
        validateList();
        armyList.saveList();
        return listRecord;
    }
    function removeRecord(listRecord){
        popRecord(listRecord);
        var removeAlso=[];
        if(listRecord.companionRecords){
            removeAlso=removeAlso.concat(listRecord.companionRecords);
        }else if(listRecord.parentRecord){
            removeAlso.push(listRecord.parentRecord);
            removeAlso=removeAlso.concat(listRecord.parentRecord.companionRecords);
        }
        $.each(removeAlso,function(index,companionRecord){
            popRecord(companionRecord);
        });
        plugins.armylistRecordDeselected(listRecord);
        validateList();
        armyList.saveList();
    }
    var getListRecordsAsList=armyList.getListRecordsAsList=function(){
        var listRecords=[];
        $('#armyList .armyListModelRow').each(function(){
            listRecords.push(listRecordsById[$('.recordId',this).text()]);
        });
        return listRecords;
    }
    
    function addRecordToView(listRecord,replaceThis){
        var row=listRecord.row=$('<tr class="armyListModelRow" />'),model=listRecord.model,id=listRecord.id;
        if(model.get('irr')){
            row.addClass('irregular');
        }
        if(model.shouldSkipModelCount){
            row.addClass('noOrder');
        }
        if(model.isSynchronizedUnit){
            row.addClass('synchronizedUnit');
        }
        var cell=$('<td class="modelIcon" />').appendTo(row);
        $('<img />').attr('src',utils.buildImagePath(model.parent.isc,'logo_small')).appendTo(cell);
        $('<td  class="modelNames" />')
        .append($('<div class="modelName" />').text(model.getDisplay('name')))
        .append(" ")
        .append($('<div class="modelCodename"  />').text(model.getDisplay('codename')))
        .appendTo(row);
        var showCostSwc=(Number(model.cost)>0 || Number(model.swc)!=0);
        var modelCost=showCostSwc?model.cost:"",modelSwc=showCostSwc?model.swc:"",swcCostSep=showCostSwc?"|":"";
        $('<td class="modelCost" />').text(modelCost).appendTo(row);
        $('<td class="swcCostSep" />').text(swcCostSep).appendTo(row);
        $('<td class="modelSwc" />').text(modelSwc).appendTo(row);
        $('<div class="recordId" />').text(id).hide().appendTo(cell);
        if(!replaceThis){
            $('#armyList table tbody').append(row);
        }else{
            replaceThis.replaceWith(row);
        }
        row.bind('click',function(){
            $('.armyListModelRow.selected').removeClass('selected');
            row.addClass('selected');
            units.showModelInfo(model);
            if(config.get('armylist.touchAction')=='showInfoAndChooser'){
                units.showModelChooser(model.get('isc'));
            }
            plugins.armylistRecordSelected(listRecord);
        }).bind('dblclick',function(){
            removeRecord(listRecord);
        });
        armylistScroll.scrollTo(row,100);
    }
    
    var colSpan=5;
    
    // BEGIN group marks handling
    function buildGroupBar(groupNum){
        var groupBar=$('<tr class="groupBar groupBar'+groupNum+'"></tr>');
        $('<td class="groupBarNum"></td>').text(groupNum).hide().appendTo(groupBar);
        $('<td class="groupBarTitle" ></td>').attr('colSpan',colSpan).text(messages.get('armylist.groups.groupTitle')+groupNum).appendTo(groupBar);
        return groupBar;
    }
    var groupMarksCount=0;
    var checkGroupMarks=function(){
        var expectedGroupNum=Math.ceil(armyList.modelCount/armyList.combatGroupSize),groupMarks;
        while(expectedGroupNum>1 && expectedGroupNum>groupMarksCount){
            log('adding group, from ',groupMarksCount,' to ',expectedGroupNum);
            groupMarks=getGroupMarks();
            groupMarks.push((expectedGroupNum-1)*armyList.combatGroupSize);
            setGroupMarks(groupMarks);
        }
        while(expectedGroupNum<groupMarksCount){
            log('removing group, from ',groupMarksCount,' to ',expectedGroupNum);
            if(expectedGroupNum<=1){
                setGroupMarks([]);
            }else{
                groupMarks=getGroupMarks();
                groupMarks.pop();
                setGroupMarks(groupMarks);
            }            
        }
        // TODO handle more than two groups
        
        groupMarks=getGroupMarks();
        if(groupMarks[0]&&groupMarks[0]>0){ // il mark group 0 deve essere fisso al punto 0
            groupMarks[0]=0;
            setGroupMarks(groupMarks);
        }
    }
    var setGroupMarks=armyList.setGroupMarks=function(groupMarks){ // will break (not error, but won't work) for empty armyLists
        $('#armyList .groupBar').remove();
        groupMarksCount=groupMarks.length;
        $.each(groupMarks,function(markIndex,pos){
            if(pos==0){
                $('#armyList .armyListModelRow').first().before(buildGroupBar(markIndex+1));
            }else{
                $('#armyList .armyListModelRow').eq(pos-1).after(buildGroupBar(markIndex+1));
            }
        });
    }
    var getGroupMarks=armyList.getGroupMarks=function(){
        var i,res=[];
        for(i=1;i<=groupMarksCount;i++){
            res.push($('#armyList .groupBar'+i).prevAll('.armyListModelRow').length); // group marker index. do not swap groups!!
        }
        return res;
    }
    // END group marks handling

    armyList.addModel=function(unitIsc,modelCode,replaceThis){
        log('adding model ',unitIsc,modelCode,replaceThis);
        var wasSelected=false;
        if(replaceThis && replaceThis.model && replaceThis.row){
            wasSelected=replaceThis.row.hasClass('selected');
            var mark=$('<div />');
            replaceThis.row.after(mark);
            popRecord(replaceThis);
            replaceThis=mark;
        };
        var newListRecord=insertModel(units.unitsByIsc[unitIsc].childsByCode[modelCode],replaceThis);
        if(wasSelected){
            newListRecord.row.addClass('selected');
        }
    };
    
    armyList.combatGroupSize=10;
    setPointCap(300);
        
    var getSelectedRecord=armyList.getSelectedRecord=function(){
        var row=$('#armyList .armyListModelRow.selected');
        if(row[0]){
            return listRecordsById[$('.recordId',row).text()];
        }else{
            return null;
        }
    };

