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

var units=ia.units={};

(function(){    
	
    //    var enableDrag=$(window).width()>1000;
    
    var flagIcons={};
    function addFlagIcon(name){
        flagIcons[name]='<img src="'+utils.getBasePath()+utils.buildImagePath(name,'icon')+'" class="flagIcon" title="'+messages.get('units.flagicon.'+name)+'"/>';
    }
    addFlagIcon('irregular');
    addFlagIcon('impetuous');
    addFlagIcon('frenzy');
    addFlagIcon('regular');
    addFlagIcon('cube');
    addFlagIcon('cube2');
    //flagIcons['cube']="<span class=\"flagIcon\">C</span>";
    
    var unitsByIsc=units.unitsByIsc={};
    
    //utils
    function compareByCost(model1,model2){
        if(model1.parent.isPseudoUnit){
            if(!model2.parent.isPseudoUnit){
                return 1;
            }
        }
        else if(model2.parent.isPseudoUnit){
            return -1;
        }
        var cost1=Number(model1.cost),cost2=Number(model2.cost),swc1=Number(model1.swc),swc2=Number(model2.swc);
        return cost1!=cost2?cost1-cost2:swc1-swc2;
    }
	
    // BEGIN attribute loading	
    var singleAttrs=units.singleAttrs=["code","codename","cost","swc","army","isc","name","type","cost","swc","mov","cc","bs","ph","wip","arm","bts","w","ava","irr","imp","cube","note","cbcode"];
    var multiAttrs=units.multiAttrs=["spec","bsw","ccw","cbcode"];
    var getDisplay=function(attr){
        return this['display_cache_'+attr] || (this['display_cache_'+attr]=names.get(attr.replace(/Orig$/,''),this.get(attr)));
    }
    function loadAttrs(targetObj,parentObj){		
        if(!targetObj['codename'] && targetObj['code']){
            targetObj['codename']=targetObj['code'];
        }
        $.each(multiAttrs,function(index,attrName){
            $.each(targetObj[attrName],function(i,value){
                targetObj[attrName][value]=value;
            });
            targetObj[attrName].add=function(value){
                this.push(value);
                this[value]=value;
            };
            if(parentObj){
                targetObj[attrName+'Orig']=$.extend([],targetObj[attrName]);
                $.each(parentObj[attrName],function(index,value){
                    targetObj[attrName].add(value);
                });
            }
        });
    }	
    function prepareCbImages(unit){
        unit.cbImages={
            logo:[],
            icon:[],
            imageBlue:[],
            imageBg:[],
            imagesBig:[]
        }
        $.each(unit.cbcode,function(index,cbCode){
            var rootUrl='http://www.infinitythegame.com/infinity/catalogo/'+cbCode;
            unit.cbImages.logo.push(rootUrl+'-icono.png');
            unit.cbImages.icon.push(rootUrl+'-recorte.png');
            var azul=rootUrl+'-azul.jpg',maq=rootUrl+'-maqueta1.jpg';
            unit.cbImages.imageBlue.push(azul);
            unit.cbImages.imagesBig.push(azul);
            unit.cbImages.imageBg.push(maq);
            unit.cbImages.imagesBig.push(maq);
        });
    }
    var getCompanions=function(){
        if(!this.companions_cache){
            var companions=[];
            $.each(this.spec,function(x,spec){
                if(spec.indexOf('Companion')==0){
                    var companionStr=spec.replace(/Companion *: */,'').replace(/ [(][0-9]+[)]$/,'');
                    var count=Number(spec.replace(/.*[(]([0-9]+)[)]$/,"$1"))||1;
                    var split=companionStr.split('-');
                    var companion;
                    if(unitsByIsc[companionStr]){
                        companion=unitsByIsc[companionStr].defaultChild;
                    }else if(unitsByIsc[split[0]]){
                        var unit=unitsByIsc[split[0]],model=unit.childsByCode[split[1]];
                        companion=model;
                    }else{
                        log('companion not found for spec : ',spec);
                        return;
                    }
                    for(;count>0;count--){
                        companions.push(companion);
                    }
                }
            });
            this.companions_cache=companions;
        }
        return this.companions_cache;
    };
    var getAllSpec=function(){
        if(!this['all_spec_cache']){
            var specs=[];
            specs.add=function(item){
                this.push(item);
                this[item]=item;
            };
            specs.concat=function(items){
                var me=this;
                $.each(items,function(i,item){
                    me.add(item); 
                });
                return me;
            };
            if(this.get('cube')=='X' || this.get('cube')=='C' || this.get('cube')=='1'){
                specs.add('Cube');
            }else if(this.get('cube')=='2'){
                specs.add('Cube 2.0');
            }
            if(this.get('irr')=='X' || this.get('irr')=='I'){
                specs.add('Irregular');
            }
            if(this.get('imp')=='F'){
                specs.add('Frenzy');
            }else if(this.get('imp')=='X' || this.get('imp')=='I'){
                specs.add('Impetuous');
            }
            this['all_spec_cache']=specs.concat(this.get('spec'));
        }
        return this['all_spec_cache'];
    };
    var getAllSpecDisplay=function(config){
        return  names.get('spec',this.getAllSpec(),config);
    };
    var getAllWeapons=function(){
        //        var weapons=[];
        return ([]).concat(this.get('bsw')).concat(this.get('ccw'));
    //        if(this.get('spec')['Forward Observer']||this.get('spec')['Hacking Device Plus']){
    //            weapons.push('Forward Observer');
    //            weapons.push('Flash Pulse');
    //        }
    //        return weapons;
    };
    var getAllWeaponsForTable=function(){
        var weapons=this.getAllWeapons();
        if(this.get('spec')['Forward Observer']||this.get('spec')['Hacking Device Plus']){
            weapons.push('Forward Observer');
            weapons.push('Flash Pulse');
        }
        if(this.get('type')=='TAG'&&this.get('ccw').length==0){
            weapons.push('TAG Fist');
        }
        return weapons;
    };
    var getAllSpecAndWeaponsDisplay=function(){
        var spec=this.getDisplay("spec"),bsw=this.getDisplay("bsw"),ccw=this.getDisplay("ccw");
        //                var spec=this.getAllSpecDisplay(),bsw=this.getDisplay("bsw"),ccw=this.getDisplay("ccw");
        var res=spec;
        if(res.length>0 && bsw.length>0){
            res+=", "+bsw;
        }else{
            res+=bsw;
        }
        if(res.length>0 && ccw.length>0){
            res+=", "+ccw;
        }else{
            res+=ccw;
        }
        return res;
    //        return "TODO";
    };
    var getWoundType=function(){
        if(this.get('wtype')){
            return this.get('wtype');
        }else if(this.get('type')=='REM' || this.get('type')=='TAG'){
            return 'str';
        }else{
            return 'w';
        }
    };
	var getPublicModel=function(){
		if(this.code == 'Lieutenant'){
			return this.parent.childsByCode['Default'];
		}else{
			return null; //TODO better handling
		}
	};
    plugins.configureMethod('getUnitValue',{
        chain:true,
        chainIndex:1
    });
    plugins.registerPlugin('defaultGetUnit',{
        getUnitValue:function(attrName,originalValue,unit){
            return originalValue;
        }
    });
    var getLocalAttr=function(attrName){
        return plugins.getUnitValue(attrName,this[attrName],this);
    };
    
    var commonMethods={
        getLocalAttr:getLocalAttr,
        getDisplay:getDisplay,
        getAllSpec:getAllSpec,
        getAllSpecDisplay:getAllSpecDisplay,
        getAllWeapons:getAllWeapons,
        getAllWeaponsForTable:getAllWeaponsForTable,
        getCompanions:getCompanions,
        getWoundType:getWoundType,
        getAllSpecAndWeaponsDisplay:getAllSpecAndWeaponsDisplay,
		getPublicModel:getPublicModel
    };
    
    var loadUnit=units.loadUnit=function(originalUnit,shouldReplace,forMercenaryCompany){
        //        log('laoding unit : ',unit);
        //        var isc=$('> isc',unitNode).text();
        var isc=originalUnit.isc;
        
        if(unitsByIsc[isc]){
            if(shouldReplace){
                delete unitsByIsc[isc];
            }else{// skip units already loaded (in case of double mercenary)
                log('unit ',originalUnit,' already loaded as ',unitsByIsc[isc],' , skipping');
                return;
            }
        }
        //log('loading unit ',isc);
        var copy=$.extend(true,{},originalUnit);
        if(forMercenaryCompany){
            var ava=copy.ava;
            if(ava=='T'){
                ava=4;
            }else if(ava==0){
                ava=0;
            }else if(ava==1){
                ava='*';
            }else{
                ava=Math.floor(Number(ava)/2);
            }
            copy.ava=ava;
        }
        var unit=unitsByIsc[isc]=$.extend(copy,commonMethods,{ // deep extend
            get:getLocalAttr,
            originalUnit:originalUnit
        });
        //        if((unit.altp=originalUnit.altp||false)){
        if(unit.altp){
            $.each(unit.altp,function(i,alt){
                $.extend(alt,commonMethods,{
                    altpParentUnit:unit,
                    get:function(attr){
                        return this.getLocalAttr(attr)||this.altpParentUnit.get(attr);
                    }
                });
            });
        }else{
            unit.altp=false;
        }
        loadAttrs(unit);
        prepareCbImages(unit);
        unit.childsByCode={};
        $.each(unit.childs,function(i,originalChild){
            //			var child=$.extend(true,{},originalChild,{
            var child=$.extend($.extend(true,{},originalChild),commonMethods,{
                parent:unit,
                get:function(attr){
                    return this.getLocalAttr(attr)||this.parent.get(attr);
                },
                originalChild:originalChild
            });
            unit.childsByCode[child.code]=child;
            loadAttrs(child,unit);
            child.isSynchronizedUnit=child.spec['G: Synchronized'] || child.spec['Antipode'];
            child.shouldSkipModelCount=child.isSynchronizedUnit || child.spec['G: Servant'] ;
        });
        unit.defaultChild=unit.childsByCode['Default'];
        if(unit.defaultChild){
            unit.shouldSkipModelCount=unit.defaultChild.shouldSkipModelCount;
            unit.isPseudoUnit=(Number(unit.ava)==0)||((Number(unit.defaultChild.cost)==0 && Number(unit.defaultChild.swc)==0));
        }else{
            log('missing default child in unit : ',originalUnit);
        }
    };	
    // END attribute loading
    
    // function that searc units names, specs, weapons & stuff for a pattern
    var searchAttrs=['isc','name','codename','spec','ccw','bsw'];
    function searchUnits(pattern,searchLimit){
        var res={},resCount=0,regexp=RegExp(pattern,'i');
        $.each(unitsByIsc,function(unitIsc,unit){
            $.each(unit.childsByCode,function(childCode,model){
                $.each(searchAttrs,function(index,attrName){
                    if(regexp.test(model.getDisplay(attrName))){
                        if(!res[unitIsc]){
                            res[unitIsc]={};
                            resCount++;
                        }
                        res[unitIsc][childCode]=model;
                        return false;
                    }
                });
            });
            if(resCount>=searchLimit){
                return false;
            }
        });
        res.length=resCount;
        return res;
    }
	
    // BEGIN unit buttons	
    var unitTypes=['LI','MI','HI','WB','SK','REM','TAG','SEARCH'];
    $.each(unitTypes,function(index,unitTypeName){
        var unitTypeButton=$('<div class="unitTypeButton" />').appendTo('#typeMenu');
        unitTypeButton.text(names.get('type',unitTypeName));
        var unitButtonContainer=$('<div class="unitButtonContainer"/>').hide().appendTo('#unitMenu');
        var showUnitType=function(){
            $('.unitTypeButton.selected').removeClass('selected');
            unitTypeButton.addClass('selected');
            $('.unitButtonContainer').hide();
            unitButtonContainer.show();
            config.set('units.unitTypeView',unitTypeName);
        };
        unitTypeButton.bind('click',showUnitType);
        unitTypes[unitTypeName]={
            name:unitTypeName,
            unitButtonContainer:unitButtonContainer,
            showUnitType:showUnitType
        }
    });	
    function initUnitTypeButtonView(){
        var last=config.get('units.unitTypeView');
        if(last && unitTypes[last]){
            log('last unit type view : ',last);
            unitTypes[last].showUnitType();
        }else{
            unitTypes['LI'].showUnitType();
        }
    }
    // BEGIN SEARCH 
    var searchLimit=25;
    $('.unitTypeButton:last-child').html('<img src="images/search_icon.png" title="search"/>');
    var searchUBContainer=unitTypes['SEARCH'].unitButtonContainer;
    var searchField=$('<input id="unitSearchField" />').appendTo($('<div id="unitSearchFieldWrapper" />').appendTo(searchUBContainer)).bind('change keyup',function(){
        $('.unitButton',searchUBContainer).remove();
        var searchValue=searchField.val();
        if(searchValue&&searchValue.length>=2){
            log('searching units for val : ',searchValue);
            var searchResult=searchUnits(searchValue,searchLimit);
            log('got ',searchResult.length,' results : ',searchResult);
            if(searchResult.length<searchLimit){
                delete searchResult.length;
                $.each(searchResult,function(unitIsc,childs){
                    log('adding button for ',unitIsc);
                    var unitButton=buildButtonForUnit(unitIsc,function(){
                        hideModelChoosers();
                        buildModelChooser(unitIsc,childs).appendTo('#modelChooserScrollableWrapper');
                        modelChooserScroll.scrollToTop().updateScroll();
                        units.showModelInfo(getRepresentativeChild(childs)||unitsByIsc[unitIsc].defaultChild);
                    });
                    unitButton.appendTo(searchUBContainer);
                });
                sortUnitButtons(searchUBContainer);
                plugins.onSizeOrLayoutChanged();
            }
        }else{
            log('search value too short : ',searchValue);
        }
    });
    function getRepresentativeChild(childs){
        var childList=[];
        $.each(childs,function(code,child){
            if(child.code){ //real child record
                childList.push(child);
            }
        });
        return childList.sort(function(child1,child2) {
            return compareByCost(child1,child2);
        })[0];
    }
    // END SEARCH
	
    var selectUnit=units.selectUnit=function(unitIsc){
        units.showModelInfo(unitsByIsc[unitIsc].defaultChild);
        showModelChooser(unitIsc);	
    };
    
    var unitButtonDataByIsc={};
    function buildButtonForUnit(unitIsc,handler){
        var unit=unitsByIsc[unitIsc],unitButton=$('<div class="unitButton"/>');
        $('<img />').attr('src',utils.buildImagePath(unitIsc,'logo')).attr('title',unit.getDisplay('isc')).appendTo(unitButton);
        $('<div class="unitIsc"/>').text(unitIsc).hide().appendTo(unitButton);
        if(unit.isPseudoUnit){
            unitButton.addClass("pseudoUnit");
        }
        var unitButtonFunction=function(){
            $('.unitButton.selected , .modelChooser .modelButton.selected').removeClass('selected');
            unitButton.addClass('selected');
            config.set('units.unitView',unitIsc);
            if(handler){
                handler();
            }else{
                selectUnit(unitIsc);	
            }
        };
        unitButton.bind('click',unitButtonFunction);
        unitButtonDataByIsc[unitIsc]={
            unitButtonFunction:unitButtonFunction
        };
        return unitButton;
    }
    //    function showLastUnitView(){
    //        var last=config.get('units.unitView');
    //        if(last && unitButtonDataByIsc[last]){
    //            log('last unit view : ',last);
    //            unitButtonDataByIsc[last].unitButtonFunction();
    //        }
    //    }
    function prepareButtons(){
        $('#unitMenu .unitButton').remove();
        unitButtonDataByIsc={};
        $.each(unitsByIsc,function(unitIsc,unit){
            if(!unit.defaultChild){ //only profile
                return; //skip button
            }
            var unitButton=buildButtonForUnit(unitIsc);
            unitButton.appendTo(unitTypes[unit.type.toUpperCase()].unitButtonContainer);
        });
        //sort 'em
        $('.unitButtonContainer').each(function(){
            sortUnitButtons(this);
        });
        initUnitTypeButtonView();
        showLastModelChooser();
    }
    function showLastModelChooser(){
        var last=config.get('units.unitView');
        if(last && unitButtonDataByIsc[last]){
            log('last unit view : ',last);
            unitButtonDataByIsc[last].unitButtonFunction();
        }else{
            $('.unitButtonContainer:first-child .unitButton:first-child').trigger('click');
        }    
    }
    function sortUnitButtons(container){
        $('.unitButton',container).sort(function(unit1,unit2) {
            return compareByCost(
                unitsByIsc[$('.unitIsc',unit1).text()].defaultChild,
                unitsByIsc[$('.unitIsc',unit2).text()].defaultChild);
        }).appendTo(container);
    }
    // END unit buttons
	
    // BEGIN model chooser
    //    var modelChoosersByIsc={};
    function hideModelChoosers(){
        $('.modelChooser').remove();
    //        $('.modelChooser').hide().remove();
    //    //        $('.modelChooser.temporaryModelChooser').remove();		
    }
    var showModelChooser=units.showModelChooser=function(unitIsc){
        //        var modelChooser=modelChoosersByIsc[unitIsc];
        //        if(!modelChooser){
        hideModelChoosers();
        //        $('.modelChooser').remove();
        //        var modelChooser=
        buildModelChooser(unitIsc).appendTo('#modelChooserScrollableWrapper');
        //            modelChoosersByIsc[unitIsc]=modelChooser;
        //        modelChooser.hide().appendTo('#modelChooserContainer');
        //        //        }
        //        modelChooser.show();
        
        modelChooserScroll.scrollToTop().updateScroll();
    };
    var addFlagIcons=units.addFlagIcons=function(unit,target){
        if(!unit.shouldSkipModelCount){
            if(!unit.get('irr')){
                target.append(flagIcons.regular);
            }else{
                target.append(flagIcons.irregular);
            }
            if(unit.get('imp')=='F'){
                target.append(flagIcons.frenzy);
            }else if(unit.get('imp')=='X'){
                target.append(flagIcons.impetuous);
            }
        }
        if(unit.get('cube')=='X'){
            target.append(flagIcons.cube);
        }else if(unit.get('cube')=='2'){
            target.append(flagIcons.cube2);
        }
    };
    function buildModelChooser(unitIsc,childs){
        var modelChooser=$('<div class="modelChooser"/>');
        var unit=unitsByIsc[unitIsc];
        var table=$('<table/>').appendTo($('<div class="unitInfo" />').appendTo(modelChooser));
        var header=$('<tr class="unitHeader"/>').appendTo(table),
        values=$('<tr/>').appendTo(table),
        wrappedHeader=$('<div class="wrappedHeaderFakeTable"/>').appendTo($('<td colspan="3"/>').appendTo($('<tr class="wrappedHeader"/>').appendTo(table))),
        wrappedValues=$('<div class="wrappedValuesFakeTable"/>').appendTo($('<td colspan="3"/>').appendTo($('<tr class="wrappedValues"/>').appendTo(table)));
        var attrs=["xxx","isc","type","mov","cc","bs","ph","wip","arm","bts","w","ava"];
        var altp=[];
        $('<tr />').append($('<td  class="unitSpec unitAttr"/>').attr('colSpan',attrs.length).text(unit.getAllSpecDisplay())).appendTo(table);
        $.each(attrs,function(index,attr){
            if(attr=="xxx"){
                $('<th/>').appendTo(header);
                var row=$('<td class="unitAttr"/>').appendTo(values);
                addFlagIcons(unit,row);
                $.each(unit.altp||[],function(i,alt){
                    log('loading altp : ',alt);
                    altp.push($('<tr/>').append('<td class="unitAttr"/>').appendTo(table));
                    altp.push($('<div class="wrappedValuesFakeTable"/>').appendTo($('<td  colspan="3"/>').appendTo($('<tr class="wrappedValues"/>').appendTo(table))));
                    //                    $('<tr />').append($('<td  class="unitSpec"/>').attr('colSpan',attrs.length).text("TTODDO")).appendTo(table);
                    $('<tr />').append($('<td  class="unitSpec"/>').attr('colSpan',attrs.length).text(alt.getAllSpecAndWeaponsDisplay())).appendTo(table);
                });
            }else{
                $('<th/>').addClass(attr+'Header').text(messages.get('units.attribute.'+(attr=='w'?unit.getWoundType():attr))).appendTo(header).clone().appendTo(wrappedHeader);
                var utext=unit.getDisplay(attr);
                var fieldCell=$('<td class="unitAttr"/>').addClass(attr+"Attr").text(utext).appendTo(values).clone().appendTo(wrappedValues);
                $.each(unit.altp||[],function(index,alt){
                    var text=alt.getDisplay(attr);
                    //                    if(text==utext){
                    //                        text='';
                    //                    }
                    fieldCell.clone().text(text).appendTo(altp[index*2]).clone().appendTo(altp[index*2+1]);
                });
            }
        });
        names.createCmAttrForMov(table);
        $('.wrappedHeaderFakeTable , .wrappedValuesFakeTable',table)
        .find('.iscAttr , .typeAttr , .iscHeader , .typeHeader').remove();
        table=$('<table/>').appendTo($('<div class="modelButtonList" />').appendTo(modelChooser));
        //        attrs=["codename","cost","swc","spec","bsw","ccw","note"];
        attrs=["codename","cost","swc","spec","bsw","ccw","note","swc","cost"];
        header=$('<tr/>').appendTo(table);
        $.each(attrs,function(index,attr){
            $('<th/>').text(messages.get('units.attribute.'+attr)).addClass(attr+'ModelAttr').appendTo(header);
        });
        $.each(childs||unit.childsByCode,function(index,child){
            var modelButton=$('<tr class="modelButton"/>').appendTo(table);
            $.each(attrs,function(index,attr){
                var text=attr=='spec'?child.getDisplay('specOrig'):child.getDisplay(attr);
                $('<td class="modelAttr"/>').addClass(attr+'ModelAttr').appendTo(modelButton).text(text);
            });
            $('<div class="modelCode" />').text(child.code).hide().appendTo($('td:first-child',modelButton));
            modelButton.bind('click',function(){
                var dblClick=modelButton.hasClass('selected');
                $('.modelChooser .modelButton.selected').removeClass('selected');
                modelButton.addClass('selected');
                units.showModelInfo(child);
                log('selected model',child);
                if(dblClick || (config.get('units.modelSelectionMode')=='singleClick')){
                    if(!unit.isPseudoUnit){
                        armyList.addModel(child.parent.isc,child.code);
                        if(config.get('units.smallScreen.showListAfterAdd')){
                            menu.switchMode('armylistMode');
                        }
                    }
                }
            });
            modelButton.draggable({
                helper:function(){
                    return $('<div class="modelDragHelper"></div>').text(child.getDisplay('isc')+' '+child.getDisplay('codename'))[0];
                },
                cursorAt:{
                    top: 13, 
                    left: 150  
                },
                appendTo: "#inlineFloaters",
                //                revert:'valid',
                //                revertDuration:0,
                connectToSortable:'#armyList tbody',
                //                stack:'#armyList',
                stop:function(e,ui){
                    var dropped=$('#armyList .modelButton');
                    if(dropped.length!=0){
                        //                        var index=$('#armyList .modelButton , #armyList .armyListModelRow').index(dropped[0]);
                        //                        dropped.remove();
                        armyList.addModel(child.parent.isc,child.code,dropped);
                    }
                }
            });
        });        
        //sort 'em
        $('.modelButton',table).sort(function(unit1,unit2) {
            return compareByCost(
                unit.childsByCode[$('.modelCode',unit1).text()],
                unit.childsByCode[$('.modelCode',unit2).text()]);
        }).appendTo(table);
		
        if(unitIsc.match(/.* Spec-Ops$/)){
            units.buildSpecopForm().appendTo(modelChooser);
        }
        
        return modelChooser;
    }
    // END model chooser
    	
    units.clear=function(){
        units.includeMercs=false;
        unitsByIsc=units.unitsByIsc={};
        $('.unitButton , #modelChooserContainer .modelChooser').remove();
        //        modelChoosersByIsc={};
        units.clearModelInfo();
        $('#favicon').attr("href","images/app_logo_small.png");
    };
    function loadUnitsRaw(factionName,sectorialName,forMercenaryCompany){
        var sectorialData,shouldLoad,mercenary=factionName=='Mercenary';
        if(sectorialName){
            var sectorialIscs={};
            $.each(data.sectorials,function(i,sectorial){
                if(sectorial.name==sectorialName){
                    sectorialData=sectorial;
                    return false;
                }
            });
            $.each(sectorialData.units,function(i,unit){
                sectorialIscs[unit.isc]=true;
            });
            shouldLoad=function(unit){
                return sectorialIscs[unit.isc]; // check for double will be done in loadUnti()
            };
        }else{
            if(!mercenary){
                if(!forMercenaryCompany){
                    shouldLoad=function(unit){
                        return unit.army==factionName;
                    };
                }else{
                    shouldLoad=function(unit){
                        return unit.army==factionName && !unit.isc.match(/.* Spec-Ops$/) && $.inArray('Personality',unit.spec)==-1;
                    };
                }
            }else{
                shouldLoad=function(unit){
                    return unit.army==factionName && (!unit.notFor || $.inArray(units.factionName,unit.notFor)<0);
                };                
            }
        }
        $.each(data.units,function(i,unit){
            if(shouldLoad(unit)){
                loadUnit(unit,false,forMercenaryCompany);
            }
        })
        if(sectorialData){
            var linkable='Linkable';
            $.each(sectorialData.units,function(i,sdUnit){
                var isc=sdUnit.isc;
                var unit=unitsByIsc[isc];
                if(!unit){
                    log('missing sectorial unit : ',isc);
                    return;
                }
                unit.ava=sdUnit.ava;
                if(sdUnit.linkable){
                    unit.spec.add(linkable);
                    $.each(unit.childsByCode,function(x,model){
                        model.spec.add(linkable);                      
                    });
                }
            });
        }
        try{
            //            armyList.postLoadProcessing();
            plugins.armylistPostLoadProcess();
        }catch(e){
            log('error in plugins.armylistPostLoadProcess() : ',e);
        }
        prepareButtons();
        log('loaded units ',unitsByIsc);
    }
        
    function setLogoName(logoName){
        utils.logoName=logoName;
        units.faviconPath=utils.buildImagePath(utils.logoName,"logo_small");
        units.logoPath=utils.buildImagePath(utils.logoName,"logo");
        $('#favicon').attr("href",units.faviconPath);
    }
        
    units.loadUnitsForMercenaryCompany=function(factions){
        log('loading mercenary faction');
        setLogoName('Mercenary Company');
        units.faviconPath=utils.buildImagePath(utils.logoName,"logo_small");
        units.factionName='Mercenary Company';
        units.mercenaryFactions=factions;
        units.sectorialName=null;
        $.each(factions,function(x,faction){
            loadUnitsRaw(faction,null,true);
        });
        units.loadMercs();
    };
	
    units.loadUnits=function(factionName,sectorialName){
        log('loading ',factionName,'(',sectorialName,')');
        units.factionName=factionName;
        units.sectorialName=sectorialName;
        setLogoName(sectorialName?sectorialName:factionName);
        loadUnitsRaw(factionName,sectorialName);
    };
	
    units.includeMercs=false;
    units.loadMercs=function(){
        if(!units.includeMercs && !(units.factionName=='Combined Army')){
            loadUnitsRaw('Mercenary');
            units.includeMercs=true;
        }
    };
    
    units.loadUnitsForList=function(list){
        units.clear();
        if(list.faction=='Mercenary Company'){
            units.loadUnitsForMercenaryCompany(list.mercenaryFactions);
        }else{
            units.loadUnits(list.faction,list.sectorial);
            if(list.includeMercs){
                units.loadMercs()
            }
        }
    }
    
    
    
    units.getFactionNameDisplay=function(){
        return names.get('faction',units.factionName);
    }
    units.getSectorialNameDisplay=function(){
        return units.sectorialName?names.get('faction',units.sectorialName):'';
    }
    
    
    //    var modelScroll=new iScroll('modelChooserContainerScrollWrapper', {
    //        hScrollbar: false, 
    //        vScrollbar: false
    //    });
    //    var updateModelScroll=function(){
    //        setTimeout(function () {
    //            $('#modelChooserContainerScrollWrapper').css('height',$(window).height()-$('#topBar').height()-$('#typeAndUnitMenuWrapper').height()-20);
    //            setTimeout(function () {
    //                modelScroll.refresh();
    //            },100);
    //        },100);
    //    }
    //    updateModelScroll();
    
    
    // SCROLLABLE
    var modelChooserScroll=utils.createScroll({
        getScrollWrapper:function(){
            return $('#modelChooserScrollWrapper');
        },
        getAvailableHeight:function(){
            return $(window).height()
            -($('#topBar').css('display')=='none'?0:$('#topBar').outerHeight(true))
            -($('#mainContainer').outerHeight(true)-$('#modelChooserScrollWrapper').height())
            -($('#weaponsInfo').css('display')=="none"?0:$('#weaponsInfo').outerHeight(true))
            -($(window).width()>$(window).height()||$('#smallScreenTopBar').css('display')=="none"?0:$('#smallScreenTopBar').outerHeight(true))
            +1;
        },
        getExpectedHeight:function(){
            return $('#modelChooserScrollableWrapper').outerHeight(false);
        },
        name:'modelChooserScroll',
        beforeEnable:function(){
            $('#modelChooserContainer .modelButton').draggable('disable');
        },
        afterDisable:function(){
            $('#modelChooserContainer .modelButton').draggable('enable');
        }
    });
//    units.updateScroll=function(){
//        if(modelChooserScroll){
//            modelChooserScroll.updateScroll();
//        }
//    }
    plugins.registerPlugin('unitsScroller',{
        onSizeOrLayoutChanged:function(){
            if(modelChooserScroll){
                modelChooserScroll.updateScroll();
            }
        }
    });
    // END SCROLLABLE

    function clearCache(item){
        $.each(item,function(attrName,attrValue){
            if(attrName.match(/cache/)){
                delete item[attrName];
            } 
        });
    }
    units.clearAllCache=function(){
        log('clearing unit cache');
        $.each(units.unitsByIsc,function(i,unit){
            clearCache(unit);
            $.each(unit.childsByCode,function(i,child){
                clearCache(child);
            });
            $.each(unit.altp||[],function(i,alt){
                clearCache(alt);
            });
        });
        showLastModelChooser(); // clear display
    };
    
})();
