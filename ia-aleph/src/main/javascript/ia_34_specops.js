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
	
    var newSpecop=units.newSpecop=function(base){
        var oldsop=getSpecop(),basesop=oldsop.originalUnit,oldExtra=oldsop.extra;
        log('creating new specop from base unit ',base,' and base specop ',basesop);
        var newsop=$.extend($.extend(true,{},base),{
            specop:true,
            isc:basesop.isc,
            name:basesop.name,
            cbcode:basesop.cbcode,
            ava:'1',
            base:{
                isc:base.isc,
                code:base.childs[0].code
            },
            extra:oldExtra||newSpecopExtra()
        });
        newsop.childs[0].codename=newsop.childs[0].codename||newsop.childs[0].code;
        newsop.childs[0].code='Default';
        addSpecop(newsop);
        return newsop;
    };
	
    function addSpecop(newsop){	
        log('loading specop ',newsop);	
        units.loadUnit(newsop,true);
        afterChange();
    }
	
    function newSpecopExtra(){
        return {
            xpcost:0,
            attrboost:{},
            weapons:{},
            specs:{}
        };
    }
	
    //	function importExtra(newsop,extra){
    //		if(extra){
    //			newsop.extra=extra;
    //		}else{
    //			extra=newsop.extra;
    //		}
    //		//TODO
    //	}
    function applyExtra(specop){
        if(specop && specop.extra){
            var xpCost=0;
            $.each(specop.extra.attrboost,function(attr,boostLevel){
                for(boostLevel=Number(boostLevel);boostLevel>0;boostLevel--){
                    var boost=data.specops.attributeboost[attr][boostLevel-1];
                    specop[attr]=Number(specop[attr])+Number(boost);
                    xpCost+=Number(data.specops.attributeboostcost[boostLevel-1]);
                }
            });
            $.each(specop.extra.weapons,function(weaponName,x){
                var weapon=weapons.weaponsByName[weaponName];
                xpCost+=Number(data.specops.extraweapons[units.factionName][weaponName]);
                if(weapon.canCc){
                    specop.childs[0].ccw.push(weaponName);
                }else{
                    specop.childs[0].bsw.push(weaponName);
                }
            });
            $.each(specop.extra.specs,function(specName,x){
                xpCost+=Number(data.specops.extraspecs[specName]);
                if(specName=='Hacker (Hacking Device)'){
                    specop.spec.push('Hacker');
                    specop.spec.push('Hacking Device');
                }else if(specName=='Cube'){
                    specop.cube='X';
                }else if(specName=='Minelayer'){
                    specop.spec.push('Minelayer');
                    specop.childs[0].bsw.push('Antipersonnel Mines');
                }else{
                    specop.spec.push(specName);
                }
            });
            specop.extra.xpcost=xpCost;
            campaign.xpSpentForSpecop=xpCost;
            campaign.updateCost();
        }
    };
	
    var importSpecop=units.importSpecop=function(toimport){
        log('importing specop ',toimport);
        var newsop=newSpecop(getBaseModel(toimport.base.isc,toimport.base.code));
        newsop.extra=toimport.extra;
        applyExtra(newsop);
        addSpecop(newsop);
    };
	
    function getSpecopIsc(){
        return data.specops.specopsisc[units.sectorialName]||data.specops.specopsisc[units.factionName];
    }
	
    var getSpecop=units.getSpecop=function(){
        return units.unitsByIsc[getSpecopIsc()];
    };
	
    function applyChanges(){
        importSpecop(getSpecop());
    }
	
    function afterChange(){
        //		importExtra(getSpecop());
        //		applyExtra(getSpecop());
        $('.unitButton.selected').trigger('click');
        var currentRecord=armylist.listRecordsByIsc[getSpecopIsc()]||null,specop=getSpecop();
        if(currentRecord){
            armylist.addModel(specop.isc,specop.defaultChild.code,currentRecord[0]);
        }
    }
	
    function getBaseModels(){
        return data.specops.basemodels[units.sectorialName]||data.specops.basemodels[units.factionName];
    }
	
    var baseModels={};
    function getBaseModel(isc,code){
        var res=baseModels[isc+'-'+code];
        if(!res){
            $.each(data.units,function(i,rawUnit){
                if(rawUnit.army==units.factionName && rawUnit.isc==isc){
                    $.each(rawUnit.childs,function(i,rawChild){
                        if(rawChild.code==code){
                            res=$.extend(true,{},rawUnit);
                            res.childs=[$.extend(true,{},rawChild)];
                            return false;
                        }
                    });
                    if(res){
                        return false;
                    }
                }
            });
            baseModels[isc+'-'+code]=res;
        }
        return res;
    }
		
    units.buildSpecopForm=function(){
        var specopForm=$('<div class="specopForm" />');
        var specop=getSpecop(),currentBaseIsc=specop.base?specop.base.isc:null;
        if(!specop.extra){
            specop.extra=newSpecopExtra();
        }
        var baseModelsByIsc={},baseModels=getBaseModels();
        //		if(baseModels.length==1 && !currentBaseIsc){
        //			newSpecop(getBaseModel(baseModels[0].isc,baseModels[0].code));
        //			return null;
        //		}
        $('<div class="sopFormTitle" />').text(messages.get('specop.sopFormTitle')).appendTo(specopForm);
        var sopFormHeader=$('<div class="sopFormHeader" />').appendTo(specopForm);
        var baseModelChooserContainer= $('<div class="baseModelChooserContainer" />').appendTo(sopFormHeader);
        var baseModelSelector=$('<select class="baseModelSelector"/>').appendTo(baseModelChooserContainer).before($('<span />').text(messages.get('specop.chooseBaseModelLabel')));
        var defaultChoose=$('<option />').attr('value','none').text(messages.get('specop.chooseBaseModel')).appendTo(baseModelSelector);
        $.each(baseModels,function(i,basemodel){
            baseModelsByIsc[basemodel.isc]=basemodel;
            $('<option />').attr('value',basemodel.isc).text(names.get('isc',basemodel.isc)).appendTo(baseModelSelector);
        });
        baseModelSelector.bind('change',function(){
            var basemodel=baseModelsByIsc[baseModelSelector.val()];
            if(basemodel){
                specop.base=basemodel;
                applyChanges();
            }
        });
        if(currentBaseIsc){
            baseModelSelector.val(currentBaseIsc);
            var currentBaseModel=baseModelsByIsc[currentBaseIsc],currentBaseModelData=getBaseModel(currentBaseModel.isc,currentBaseModel.code);
            defaultChoose.attr('disabled','disabled');
			
            // XP COST
            $('<div class="costContainer" />').text(messages.get('campaign.totalXpCost')).append($('<span class="totalXpCost costValue" />').text(campaign.xpSpentTotal||'0')).appendTo(sopFormHeader);
            $('<div class="costContainer" />').text(messages.get('specop.xpCost')).append($('<span class="costValue" />').text(specop.extra?specop.extra.xpcost:'0')).appendTo(sopFormHeader);
		
            // UPGRADE STATS
            var boostableAttrsContainer=$('<div class="boostableAttrsContainer" />').appendTo(specopForm);
            boostableAttrsContainer.append($('<div class="boostableAttrsContainerLabel" />').text(messages.get('specop.boostableAttrsContainerLabel')));
            var boostableAttrs=['cc','bs','ph','wip','arm','bts','w'];
            $.each(boostableAttrs,function(i,attrName){
                var select=$('<select class="boostableAttrSelect"/>').appendTo(boostableAttrsContainer);
                var i,boost=0,cost=0,maxBoost=Number(data.specops.attributeboostmax[attrName]||99)-Number(currentBaseModelData[attrName]);
                for(i=0;i<4;i++){
                    var newboost=Math.min(boost+(i==0?0:Number(data.specops.attributeboost[attrName][i-1])),maxBoost),incboost=newboost-boost;
                    boost=newboost;
                    cost+=i==0?0:Number(data.specops.attributeboostcost[i-1]);
                    if(i==0||incboost){
                        var boostText=boost?('+'+boost+' '):'',
                        attrText=messages.get('units.attribute.'+attrName),
                        costText=cost==0?'':(' ('+cost+' XP)');
                        $('<option />').attr('value',i).text(boostText+attrText+costText).appendTo(select);
                    }
                }
                select.bind('change',function(){
                    var newLevel=select.val();
                    specop.extra.attrboost[attrName]=newLevel;
                    applyChanges();
                });
                select.val(specop.extra.attrboost[attrName]||0);
            });
			
            // EXTRA WEAPONS
            var extraWeaponsContainer=$('<div class="extraWeaponsContainer" />').appendTo(specopForm);
            extraWeaponsContainer.append($('<div class="extraWeaponsContainerLabel" />').text(messages.get('specop.extraWeaponsContainerLabel')));
            $.each(data.specops.extraweapons[units.factionName],function(weaponName,cost){
                var weapon=weapons.weaponsByName[weaponName],weaponCb;
                var firstclick=true;
                function changeValue(){
                    if(!firstclick){
                        return;
                    }
                    firstclick=false;
                    if(specop.extra.weapons[weaponName]){
                        delete specop.extra.weapons[weaponName];
                    }else{
                        specop.extra.weapons[weaponName]=true;
                    }
                    applyChanges();
                }
                $('<div class="extraWeaponWrapper" />')
                .append(weaponCb=$('<input type="checkbox" />').attr('value',weaponName).bind('change click',function(){
                    changeValue();
                    return false;
                }))
                .append($('<span class="extraWeaponLabel" />').text(weapon.getDisplay('name')+' ('+cost+' XP)'))
                .bind('click',function(){
                    changeValue();
                    return false;
                })
                .appendTo(extraWeaponsContainer);
                if(specop.extra.weapons[weaponName]){
                    //weaponCb.attr('checked','checked');
                    //weaponCb.attr('checked',true);
                    weaponCb.prop("checked", true)
                }
            });
			
            // EXTRA SPECS
            var extraSpecsContainer=$('<div class="extraSpecsContainer" />').appendTo(specopForm);
            extraSpecsContainer.append($('<div class="extraSpecsContainerLabel" />').text(messages.get('specop.extraSpecsContainerLabel')));
            $.each(data.specops.extraspecs,function(specName,cost){
                var specCb;
                var firstclick=true;
                function changeValue(){
                    if(!firstclick){
                        return;
                    }
                    firstclick=false;
                    if(specop.extra.specs[specName]){
                        delete specop.extra.specs[specName];
                    }else{
                        specop.extra.specs[specName]=true;
                    }
                    applyChanges();
                }
                $('<div class="extraSpecWrapper" />')
                .append(specCb=$('<input type="checkbox" />').attr('value',specName).bind('change click',function(){
                    changeValue();
                    return false;
                }))
                .append($('<span class="extraSpecLabel" />').text(names.get('spec',specName)+' ('+cost+' XP)'))
                .bind('click',function(){
                    changeValue();
                    return false;
                })
                .appendTo(extraSpecsContainer);
                if(specop.extra.specs[specName]){
                    //specCb.attr('checked','checked');
                    //specCb.attr('checked',true);
                    specCb.prop("checked", true)
                }
            });
        }
		
        // iscroll select fix (TODO check if really needed)
        specopForm.find('select').each(function(){
            this.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, false);
            this.addEventListener('mousedown', function(e) {
                e.stopPropagation();
            }, false);
        });
		
        return specopForm;
    };
    
})();
