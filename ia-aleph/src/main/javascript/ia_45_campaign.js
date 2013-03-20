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

var campaign=ia.campaign={};

(function(){
    
    //    function getScreenImg(screenName){
    //        var currentLang=messages.getLang(),defaultLang=messages.getDefaultLang();
    //        return 'images/'+screenName+'_'+((messages.screens[currentLang] && messages.screens[currentLang][screenName]) ? currentLang : defaultLang)+'.png';
    //    }
    //    var campaignControlScreenScroller,
    //    imageWidth=data.campaign.militaryspecs.screensize[0],
    //    imageHeight=data.campaign.militaryspecs.screensize[1],
    //    controlScreenImg=getScreenImg('control_screen_military_specialities'),
    var
    campaignToolsContainer=$('#campaignToolsContainer'),
    campaignToolsContent=$('#campaignToolsContent'),
    //    controlScreen,
    //    actualWidth=imageWidth,
    //    actualHeight=imageHeight,
    militarySpecsStorageKey='campaign.militarySpecs',
    militarySpecs=campaign.militarySpecs=storage.unpack(militarySpecsStorageKey)||{};
    campaign.xpSpentForMilitarySpecs=0;
    campaign.xpSpentTotal=0;
    campaign.xpSpentForSpecop=0;
        
    campaign.updateCost=function(){
        campaign.xpSpentTotal=campaign.xpSpentForMilitarySpecs+campaign.xpSpentForSpecop;
        $('.totalXpCost').text(campaign.xpSpentTotal);
    };
        
    campaign.isEnabled=function(){
        return militarySpecs.enabled?true:false;
    };
    //    campaign.getSwcIncrement=function(){
    //        var map={
    //            2:1,
    //            3:2,
    //            4:2,
    //            0:0
    //        };
    //        if(!militarySpecs.enabled){
    //            return 0;
    //        }else {
    //            return map[militarySpecs.logistics||0]||0;
    //        }
    //    };
    //    campaign.getPointIncrement=function(){
    //        var map={
    //            0:0,
    //            1:5,
    //            2:15,
    //            3:25,
    //            4:40
    //        };
    //        if(!militarySpecs.enabled){
    //            return 0;
    //        }else {
    //            return map[militarySpecs.mobilereserve||0]||0;
    //        }
    //    };
    plugins.registerPlugin('campaign',{
        getUnitValue:function(attrName,originalValue,unit){
            if(!militarySpecs.enabled){
                return originalValue;
            }else if(attrName=='w' 
                && !isNaN(originalValue) 
                && militarySpecs.support>=4 
                && unit.getWoundType()==='str'){
                return Math.min(3,Number(originalValue)+1);
            }else if(attrName=='spec' && militarySpecs.psiops>=4 && !originalValue['Religious Troop'] && unit.get('type')!=' '){
                var newSpec=$.extend([],originalValue);
                newSpec['Religious Troop']='Religious Troop';
                newSpec.push('Religious Troop');
                return newSpec;
            }else if(attrName=='ava' && militarySpecs.support>=1 && militarySpecs.extraAva && !isNaN(originalValue) && (
                (unit.get('isc')==militarySpecs.extraAva[1])
                ||(militarySpecs.support>=2 && unit.get('isc')==militarySpecs.extraAva[2])
                ||(militarySpecs.support>=3 && unit.get('isc')==militarySpecs.extraAva[3])
                )){
                return Number(originalValue)+1;
            }else{
                return originalValue;
            }
        },
        getPointIncrement:function(){
            var map={
                0:0,
                1:5,
                2:15,
                3:25,
                4:40
            };
            if(!militarySpecs.enabled){
                return 0;
            }else {
                return map[militarySpecs.mobilereserve||0]||0;
            }
        },
        getSwcIncrement:function(){
            var map={
                2:1,
                3:2,
                4:2,
                0:0
            };
            if(!militarySpecs.enabled){
                return 0;
            }else {
                return map[militarySpecs.logistics||0]||0;
            }
        }        
    });
    //    campaign.getWoundForUnit=function(unit){
    //        var strValue=unit['w'];
    //        if(!militarySpecs.enabled || isNaN(strValue) || !(militarySpecs.psiops>=4) || unit.getWoundType()!=='str'){
    //            return strValue;
    //        }else{
    //            return Math.min(3,Number(strValue)+1);
    //        }
    //    }
    //    campaign.getUnitValue=function(attrName,originalValue,unit){
    //        if(attrName=='w' 
    //            && !isNaN(originalValue) 
    //            && militarySpecs.support>=4 
    //            && unit.getWoundType()==='str'){
    //            return Math.min(3,Number(originalValue)+1);
    //        }else if(attrName=='spec' && militarySpecs.psiops>=4 && !originalValue['Religious Troop'] && unit.get('type')!=' '){
    //            var newSpec=$.extend([],originalValue);
    //            newSpec['Religious Troop']='Religious Troop';
    //            newSpec.push('Religious Troop');
    //            return newSpec;
    //        }else if(attrName=='ava' && militarySpecs.support>=1 && militarySpecs.extraAva && !isNaN(originalValue) && (
    //            (unit.get('isc')==militarySpecs.extraAva[1])
    //            ||(militarySpecs.support>=2 && unit.get('isc')==militarySpecs.extraAva[2])
    //            ||(militarySpecs.support>=3 && unit.get('isc')==militarySpecs.extraAva[3])
    //            )){
    //            return Number(originalValue)+1;
    //        }else{
    //            return originalValue;
    //        }
    //    };
	
    var levelCosts=[2,5,9,14,20];
    function refreshCost(){
        var xpSpentForMilitarySpecs=0;
        $.each(militarySpecs,function(spec,level){
            if(level==5){
                xpSpentForMilitarySpecs+=levelCosts[5-1];
            }else{
                var i;
                for(i=1;i<=level;i++){
                    xpSpentForMilitarySpecs+=levelCosts[i-1];
                }
            }
        });
        //		$('.totalCost',campaignToolsContent).text(xpSpentForMilitarySpecs);
        campaign.xpSpentForMilitarySpecs=xpSpentForMilitarySpecs;
        campaign.updateCost();
    }
	
    refreshCost();
    //    
    var campaignControlScreenScroller=campaign.controlScreenScroller=utils.createScroll({
        getScrollWrapper:function(){
            return $('#campaignToolsScrollWrapper');
        },
        getAvailableHeight:function(){
            return $(window).height();
        //            -($('#campaignToolsContainer').outerHeight(true)-$('#campaignToolsScrollWrapper').height());
        },
        getAvailableWidth:function(){
            return $(window).width();
        //            -($('#campaignToolsContainer').outerWidth(true)-$('#campaignToolsScrollWrapper').width());
        },
        getExpectedHeight:function(){
            return $('#campaignToolsContent').height();
        },
        getExpectedWidth:function(){
            return $('#campaignToolsContent .militarySpecTableWrapper').width();
        //            return Math.max(600,$('#campaignToolsContent').width());
        },
        name:'campaignToolsScroller',
        iScrollConfig:{
            lockDirection:false,
            hScroll:true,
            vScrollbar:true,
            hScrollbar:true
        }
    });
    plugins.registerPlugin('campaignControlScreenScroller',{
        onSizeOrLayoutChanged:function(){
            campaignControlScreenScroller.updateScroll();
        }
    });
        
    campaign.skillCategories=[
    'mobilereserve',
    'logistics',
    'support',
    'psiops',
    'deployment',
    'intelligence'
    ];
	
    function buildUnitSelect(filter){
        var select=$('<select class="unitSelect" />'),units=[];
        $.each(ia.units.unitsByIsc,function(isc,unit){
            if( (filter && !filter(unit)) || !Number(unit.get('ava')) || unit.get('spec')['Personality']){
            // don't add
            }else{
                units.push({
                    value:isc,
                    text:unit.getDisplay('isc')
                });
            }
        });
        units.sort(function(a,b){
            return a.text.localeCompare(b.text);
        });
        $.each(units,function(i,unit){
            $('<option />').attr('value',unit.value).text(unit.text).appendTo(select);
        });
        return select;
    }
    
    function buildControlScreen(){
        campaignToolsContent.empty();
        var table=$('<table class="militarySpecTable" />').appendTo($('<div class="militarySpecTableWrapper" />').appendTo(campaignToolsContent)),tbody=$('<tbody />').appendTo(table),
        headers=$('<tr  class="militarySpecTableHeaders"/>').appendTo(tbody).append('<th class="emptyHeaderCell" />');
        $.each(campaign.skillCategories,function(i,category){
            $('<th  class="militarySpecTableHeader"/>').text(messages.get('campaign.militaryspecs.'+category+'.title')).appendTo(headers);
        });
        headers.append('<th class="fakeLastCell" />');
        var level;
        for(level=1;level<=5;level++){
            var levelRow=$('<tr  class="militarySpecTableRow" />').addClass('level'+level).appendTo(tbody);
            $('<td  class="militarySpecRowHeaderCell" />').addClass('level'+level).text(messages.get('campaign.militaryspecs.level'+level+'.label')).appendTo(levelRow);
            $.each(campaign.skillCategories,function(i,category){
                var thisLevel=level,selected=((militarySpecs[category]||0)>=thisLevel)||(level==5&&militarySpecs['ltident']==5);
                var militarySpecTableCell=$('<td  class="militarySpecTableCell" />').addClass('level'+level).addClass(category).text(messages.get('campaign.militaryspecs.'+category+'.level'+level+'.desc'))
                .appendTo(levelRow).bind('click',level<5?function(event){
                    if(!$(event.target).hasClass('militarySpecTableCell')){ //skip click on sub-controls
                        return;
                    }
                    if(militarySpecs[category]==thisLevel){
                        militarySpecs[category]=thisLevel-1;
                    }else{
                        militarySpecs[category]=thisLevel;
                    }
                    if(militarySpecs['logistics']!==4&&militarySpecs['support']!==4&&militarySpecs['psiops']!==4){
                        militarySpecs['ltident']=0;
                    }
                    updateCampaign();
                }:function(){
                    if(selected){
                        militarySpecs['ltident']=0;
                    }else{
                        militarySpecs['ltident']=5;
                        if(militarySpecs['logistics']!==4&&militarySpecs['support']!==4&&militarySpecs['psiops']!==4){
                            militarySpecs['logistics']=4;
                        }
                    }
                    updateCampaign();
                });
                if(selected){
                    if(level==5){
                        $('.level5.logistics',tbody).addClass('selected');
                    }else{
                        militarySpecTableCell.addClass('selected');
                    }
                }
            });
            levelRow.append('<td class="fakeLastCell" />');
        }
        $('.level5.mobilereserve , .level5.intelligence , .level5.deployment',tbody).text('').addClass('emptyCell').unbind('click');
        $('.level5.support , .level5.psiops',tbody).remove();
        $('.level5.logistics',tbody).attr('colspan','3').addClass('ltident').text(messages.get('campaign.militaryspecs.ltident.level5.desc'));
        
        $('<div class="milSpecCostContainer costContainer" />')
        .text(messages.get('specop.xpCost'))
        .append($('<span class="milSpecCost costValue" />').text(campaign.xpSpentForMilitarySpecs))
        .appendTo(campaignToolsContent); 
        
        $('<div class="totalCostContainer costContainer" />')
        .text(messages.get('campaign.totalXpCost'))
        .append($('<span class="totalXpCost costValue" />').text(campaign.xpSpentTotal))
        .appendTo(campaignToolsContent); 
        
        function enableSpecs(){
            $('.buttonLabel',campaignButton).text(messages.get('campaign.enabled.label')); 
            $('.buttonIcon',campaignButton).attr('src','images/enabled_icon.png');
            militarySpecs.enabled=true;
            saveSpecs();
        }
        function disableSpecs(){
            $('.buttonLabel',campaignButton).text(messages.get('campaign.disabled.label')); 
            $('.buttonIcon',campaignButton).attr('src','images/disabled_icon.png');
            militarySpecs.enabled=false;   
            saveSpecs();      
        }
		
        var campaignButton=$('<div class="enableButton campaignButton" />')
        .append($('<img class="buttonIcon"></img>').attr('src',campaign.isEnabled()?'images/enabled_icon.png':'images/disabled_icon.png'))
        .append($('<span class="buttonLabel"></span>').text(campaign.isEnabled()?messages.get('campaign.enabled.label'):messages.get('campaign.disabled.label')))
        .bind('click',function(){
            if(campaign.isEnabled()){
                disableSpecs();
            }else{
                enableSpecs();
            }
        }).appendTo(campaignToolsContent); 
		
        $('<div class="closeButton campaignButton" />')
        .text(messages.get('common.close'))
        .prepend($('<img class="buttonIcon"></img>').attr('src','images/delete_icon.png'))
        .bind('click',function(event){
            hideControlScreen();
        }).appendTo(campaignToolsContent); 
		
        var unitSelect= buildUnitSelect(function(unit){
            return !isNaN(unit.get('ava'));
        });
        $.each([1,2,3],function(i,l){
            unitSelect.clone()
            .bind('touchstart mousedown', function(e) {
                e.stopPropagation(); //fix for iscroll
            })
            .val(militarySpecs.extraAva?militarySpecs.extraAva[l]||'':'')
            .bind('change',function(){
                var value=$(this).val();
                if(!militarySpecs['extraAva']){
                    militarySpecs.extraAva={};
                }
                militarySpecs.extraAva[l]=value;
                if(militarySpecs.support<l){
                    militarySpecs.support=l;
                    updateCampaign();
                }else{
                    saveSpecs();      
                }
            }).appendTo($('.militarySpecTableCell.support.level'+l,campaignToolsContent));
        });
		
    }
    //    function buildControlScreen(){
    //        campaignToolsContent.empty();
    //        controlScreen=$('<img class="controlScreen"/>').attr('src',controlScreenImg).css({
    //            width:actualWidth=Math.min(Math.max(750,$(window).width()),1280),
    //            height:actualHeight=Math.round(actualWidth*imageHeight/imageWidth)
    //        }).appendTo(campaignToolsContent);
    //        
    //    }
    //    
    
    function saveSpecs(){
        storage.pack(militarySpecsStorageKey,militarySpecs);
        armylist.validateList();
    }
    
    function updateCampaign(){
        refreshCost();
        log('updating military specs : ',militarySpecs);
        saveSpecs();
        buildControlScreen();
    }
	
    //    
    //    function rebuildButtons(){
    //        $('.overlayButton , .totalCost',campaignToolsContent).remove();
    //        $.each(data.campaign.militaryspecs.skillcategories,function(i,skillCategory){
    //            var y,x=(data.campaign.militaryspecs.defaultskilloffset[0]+skillCategory.categoryoffset)*actualWidth/imageWidth,level,skillWidth,skillHeight;
    //            function buildButton(){
    //                function canHaveLevel5(){
    //                    return Math.max(militarySpecs['logistics']||0,militarySpecs['support']||0,militarySpecs['psiops']||0)>=3;
    //                }
    //                y=(data.campaign.militaryspecs.defaultskilloffset[1]+data.campaign.militaryspecs.leveloffsets[level])*actualHeight/imageHeight;
    //                skillWidth=(skillCategory.skillsize||data.campaign.militaryspecs.defaultskillsize)[0]*actualWidth/imageWidth;
    //                skillHeight=(skillCategory.skillsize||data.campaign.militaryspecs.defaultskillsize)[1]*actualHeight/imageHeight;
    //                var skillId=skillCategory.id,skillClass='skillCategory'+skillId,skillLevel=level;
    //                var skillButton=$('<div class="overlayButton" />').addClass(skillClass).addClass('skillLevel'+level).css({
    //                    top:y,
    //                    left:x,
    //                    width:skillWidth,
    //                    height:skillHeight
    //                }).bind('click',function(){
    //                    if($(this).hasClass('selected')){
    //                        //                        $(this).removeClass('selected').find('.overlayButtonCheckbox').text('');
    //                        $(this).nextAll('.'+skillClass).andSelf().removeClass('selected');
    //                        militarySpecs[skillId]=skillLevel-1;
    //                        if(!canHaveLevel5()){
    //                            delete militarySpecs['ltident'];
    //                            $('.skillCategoryltident',campaignToolsContent).removeClass('selected');
    //                        }
    //                    //                        xpSpentForMilitarySpecs-=cost;
    //                    }else{
    //                        //                        $(this).addClass('selected').find('.overlayButtonCheckbox').text('X');
    //                        $(this).prevAll('.'+skillClass).andSelf().addClass('selected');
    //                        militarySpecs[skillId]=skillLevel;
    //                        if(skillId=='ltident' && !canHaveLevel5()){
    //                            militarySpecs['logistics']=3;
    //                            $('.skillCategorylogistics',campaignToolsContent).addClass('selected');
    //                        }
    //                    //                        xpSpentForMilitarySpecs+=cost;
    //                    }
    //                    refreshCost();
    //                }).append($('<div class="overlayButtonCheckbox" />').css({
    //                    top:skillHeight + (data.campaign.militaryspecs.checkboxoffset[1]*actualHeight/imageHeight),
    //                    left:skillWidth + (data.campaign.militaryspecs.checkboxoffset[0]*actualWidth/imageWidth),
    //                    width:data.campaign.militaryspecs.checkboxsize[0]*actualWidth/imageWidth,
    //                    height:data.campaign.militaryspecs.checkboxsize[1]*actualHeight/imageHeight
    //                })).appendTo(campaignToolsContent);
    //                if(militarySpecs[skillId]!==undefined && militarySpecs[skillId]>=level){
    //                    skillButton.addClass('selected');
    //                }
    //            }
    //            if(skillCategory.id=='ltident'){
    //                level=4;
    //                buildButton();
    //            }else{
    //                for(level=0;level<4;level++){
    //                    buildButton();
    //                }
    //            }
    //        });
    //        $('<div class="totalCost" />').css({
    //            top:data.campaign.militaryspecs.spentxplocation[1]*actualHeight/imageHeight,
    //            left:data.campaign.militaryspecs.spentxplocation[0]*actualWidth/imageWidth,
    //            width:(data.campaign.militaryspecs.spentxplocation[2]-data.campaign.militaryspecs.spentxplocation[0])*actualWidth/imageWidth,
    //            height:(data.campaign.militaryspecs.spentxplocation[3]-data.campaign.militaryspecs.spentxplocation[1])*actualHeight/imageHeight
    //        }).appendTo(campaignToolsContent);
    //        refreshCost();
    //    }
    //    
    function hideControlScreen(){
        units.clearAllCache();
        $('#rootContainer').show();
        campaignToolsContainer.hide();
        campaignToolsContent.empty();
    }
    function showControlScreen(){
        buildControlScreen();
        //        rebuildButtons();
        campaignToolsContainer.show();
        $('#rootContainer').hide();
        campaignControlScreenScroller.updateScroll();
    }
    //    
    //    $(window).bind('resize',function(){
    //        if(campaignToolsContainer.css('display')!='none'){
    //            hideControlScreen()
    //            setTimeout(function(){
    //                showControlScreen();
    //            },0);
    //        }
    //    });    
    //    
    campaign.showMilitarySpecialitiesControlScreen=function(){
        showControlScreen();
    };
    
})();