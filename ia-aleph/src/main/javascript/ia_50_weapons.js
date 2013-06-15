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

var weapons=ia.weapons={};
	
(function(){
	
    var weaponsByName=weapons.weaponsByName={};
	
    var attrs=["name","short_dist","short_mod","medium_dist","medium_mod","long_dist","long_mod","max_dist","max_mod","damage","burst","ammo","template","em_vul","cc","note"];
    var rangeBars=["short","medium","long","max"];
    var rangesIn=[ 4, 8,12,16,24,32,36, 48,52,60,96,104];
    var rangesCm=[10,20,30,40,60,80,90,120,130,150,240,260];
    //var headers=[""].concat(rangesIn).concat(["D","B","A",""]);
    
    var weaponSortFunction=weapons.weaponSortFunction=function(name1,name2){
        var weapon1=weaponsByName[name1],weapon2=weaponsByName[name2];
        if(!weapon1 && weapon2){
            return 1;
        }
        if(!weapon2 && weapon1){
            return -1;
        }
        if(weapon1 && weapon2){
            if( weapon1.maxRange!=weapon2.maxRange){
                return weapon2.maxRange-weapon1.maxRange;
            }
            if( weapon1.rangeModSum!=weapon2.rangeModSum){
                return weapon2.rangeModSum-weapon1.rangeModSum;
            }
            if(weapon1.canBs!=weapon2.canBs){
                return weapon2.canBs-weapon1.canBs;
            }
        }
        return weapon1.name==weapon2.name?0:(weapon1.name>weapon2.name?1:-1);
    };
    
    function buildHeaders(table){
        var head=$('<tr  class="weaponInfoHeader" />').appendTo(table);
        var wrappedHead=$('<tr class="weaponInfoWrappedHeader" />').appendTo(table),
        wrappedCell=$('<th class="rangeHeaderSingleCell" colspan="5"/>').appendTo(wrappedHead),
        wrappedFakeTable=$('<div class="wrappedHeaderFakeTable" />').appendTo(wrappedCell);
        $('<th class="rangeUnitButton" title="click to swap range units"><div class="rangeIn">(inches)</div><div class="rangeCm">(cm)</div></th>').appendTo(head).bind('click',function(){
            weapons.toggleRangeUnits();
            return false;
        });
        $.each(rangesIn,function(index,rangeIn){
            var rangeCm= rangesCm[index];
            var cell=$('<th class="rangeHeaderWrapper"/>').appendTo(head),wrappedFakeCell=$('<div class="wrappedHeaderDiv"/>').appendTo(wrappedFakeTable);
            $('<div class="rangeHeader rangeIn" />').text(rangeIn).appendTo(cell).clone().appendTo(wrappedFakeCell);
            $('<div class="rangeHeader rangeCm" />').text(rangeCm).appendTo(cell).clone().appendTo(wrappedFakeCell);
        });
        $.each(["D","B","A","noLabel"],function(index,header){
            $('<th />').text(messages.get('weapons.label.'+header)).appendTo(head);
        });
    }
	
    //    $('weapon',datasources.weapons).each(function(){
    //        var weaponNode=$(this),weapon={};
    //        var weapon={};
    //    log('adding double weapons');
    $.each(data.weapons,function(i,weapon){
        if(!weapon.name.match("[(]2[)]$")){
            var doubleWeapon=$.extend({},weapon);
            var burst=Number(doubleWeapon.burst);
            if(burst){
                doubleWeapon.burst=(burst+1)+"";
                doubleWeapon.name=doubleWeapon.name+" (2)";
                data.weapons.push(doubleWeapon);
            //                log('new double weapon : ',doubleWeapon);
            }
        }
    });
    $.each(data.weapons,function(i,weapon){
        //        $.each(attrs,function(index,attrName){
        ////            var value=$(attrName,weaponNode).text();
        //            var value=weaponData[attrName];
        //            weapon[attrName]=value;
        //        //			var displayAttrName=utils.getDisplayAttrName(attrName);
        //        //			var displayAttrs=$(displayAttrName,weaponNode);
        //        //			if(displayAttrs.length>0){
        //        //				weapon[displayAttrName]={};
        //        //				displayAttrs.each(function(){
        //        //					weapon[displayAttrName][$(this).attr('lang')]=$(this).text();
        //        //				});
        //        //			}
        //        });
        var maxRange='--';
        $.each(['max','long','medium','short'],function(index,range){
            var value=weapon[range+'_dist'];
            if(value!='--'){
                maxRange=value;
                return false;
            }
        });
        if(maxRange=='--'){
            maxRange=0;
        }else{
            maxRange=Number(maxRange);
        }
        weapon.canCc=weapon.cc=='Yes';
        weapon.type=weapon.canCc?'ccw':'bsw';
        weapon.getDisplay=function(attrName){
            return names.get(attrName=='name'?weapon.type:'weapon_'+attrName,weapon[attrName]);
        //			var displayAttrName=utils.getDisplayAttrName(attrName),lang=messages.getLang(),defaultLang=messages.getDefaultLang();
        //			return (weapon[displayAttrName]&&(weapon[displayAttrName][lang]||weapon[displayAttrName][defaultLang]))||weapon[attrName];
        }
        weapon.maxRange=maxRange;
        weapon.canBs=weapon.burst=='--'?0:1;
        weaponsByName[weapon.name]=weapon;
        weapon.rangeModSum=0;
        $.each(getWeaponModsForRanges({
            weapon:weapon,
            ranges:rangesIn
        }),function(index,mod){
            if(mod!='--'){
                weapon.rangeModSum+=mod;
            }
        });
        //        if(weapon.name=='Forward Observer'||weapon.name=='Flash Pulse'||weapon.name=='Jammer'){
        if(weapon.attr && weapon.attr=="WIP"){
            weapon.useWip=true;
        //        }else if(weapon.name=='Grenades'||weapon.name=='Smoke Grenades'||weapon.name=='E/M Grenades'
        //            ||weapon.name=='Flash Grenades'||weapon.name=='Zero-V Smoke Grenades'){
        }else if(weapon.attr && weapon.attr=="PH"){
            weapon.usePh=true;
        }
        weapon.note=weapon.note||'';
        if(weapon.uses){
            weapon.note=(weapon.note?weapon.note+', ':'')+weapon.uses+' uses';
        }
    });
    log('loaded weapons : ',weaponsByName);
	
    function getWeaponModsForRanges(args){
        var mods=[];
        var baseValue=0;
        if(args.model){
            if(args.weapon.useWip){
                baseValue=Number(args.model.get('wip'));
            }else if(args.weapon.usePh){
                //                baseValue=Math.max(Number(args.model.parent.ph),Number(args.model.parent.bs));
                baseValue=Number(args.model.get('ph'));
            }else{
                baseValue=Number(args.model.get('bs'));                
            }
        }
        var hasXvisor=args.model&&args.model.get('spec')['X Visor'],hasX2visor=args.model&&args.model.get('spec')['X-2 Visor'];
        $.each(args.ranges,function(index,range){
            var lowerBar=false,upperBar=false;
            $.each(rangeBars,function(index,rangeBar){
                var rangeBarValue=args.weapon[rangeBar+"_dist"];
                if(rangeBarValue == "--"){
                    return false;
                }else{
                    rangeBarValue=Number(rangeBarValue);
                }
                if(rangeBarValue<range){
                    lowerBar=rangeBar;
                }else{
                    upperBar=rangeBar;
                    return false;
                }
            });
            if(upperBar){
                var mod=Number(args.weapon[upperBar+"_mod"]);
                if((hasX2visor && (upperBar=="long"||upperBar=="max"))||(upperBar=="long"&&hasXvisor)){
                    mod=Math.max(mod,0);
                }
                if(upperBar=="max"&&hasXvisor){
                    mod=Math.max(mod,-3);
                }
                var val=baseValue+mod;
                mods.push(val);
            }else{
                mods.push("--");
            }
        });
        return mods;
    }
    function getColor(range){
        var
        p=(range/20),
        g=p>=0.5?(200):(p*0.8*2*255),
        r=p>0.5?((1-p)*0.9*2*255):250,
        b=0;
        return 'rgb('
        +(Math.round(r)%256)+','
        +(Math.round(g)%256)+','
        +(Math.round(b)%256)+')';
    }
    function buildWeaponRow(model,weapon,table){
        var mods=getWeaponModsForRanges({
            ranges:rangesIn,
            model:model,
            weapon:weapon
        });
        var row=$('<tr class="weaponDataRow"/>').appendTo(table);
        var wrappedRow=$('<tr  class="wrappedRow"/>').appendTo(table),wrappedCell=$('<td colspan="5" />').appendTo(wrappedRow),wrappedFakeTable=$('<div class="wrappedFakeTable" />').appendTo(wrappedCell);
        $('<td class="weaponDisplayName" />').text(weapon.getDisplay('name')).appendTo(row);
        $('<td class="weaponName"/>').text(weapon.name).hide().appendTo(row).clone().appendTo(wrappedFakeTable);
        $.each(mods,function(index,mod){
            if(mod!="--"){
                var color='background-color: '+getColor(model?mod:(11+mod));
                $('<td class="rangeMod"/>').attr('style',color).text(mod).appendTo(row).clone().appendTo(wrappedFakeTable);
            }else{
                $('<td class="outOfRange"/>').appendTo(row).clone().appendTo(wrappedFakeTable);
            }
        });
        $('td.rangeMod:first',row).addClass('first');
        $('td.rangeMod:last',row).addClass('last');
        $('td.rangeMod:first',wrappedFakeTable).addClass('first');
        $('td.rangeMod:last',wrappedFakeTable).addClass('last');
        var damage=weapon["damage"];
        if(damage.match(/PH/) && model){
            damage=damage+" ("+(Number(model.get('ph'))+Number(damage.replace(/PH/,'')))+")";
        }
        $('<td />').text(damage).appendTo(row);
        $('<td />').text(weapon["burst"]).appendTo(row);
        $('<td />').text(names.get('ammo',weapon["ammo"])).appendTo(row);
        var specs=[];
        if(weapon['template']!='No'){
            specs.push(names.get('template',weapon['template']));
        }
        if(weapon['em_vul']!='No'){
            specs.push('E/M vul');
        }
        if(weapon['cc']!='No'){
            specs.push('cc');
        }
        if(weapon['note']!=''){
            specs.push(weapon['note']);
        }
        $('<td />').text(specs.join(", ")).appendTo(row);
        return row;
    }
    var buildWeaponTableForModel=weapons.buildWeaponTableForModel=function(model){
        var mainTable=buildWeaponTable(model.getAllWeaponsForTable(),model);
        if(model && model.get('altp')){
            $.each(model.get('altp'),function(i,altp){
                var altTable=buildWeaponTable(altp.getAllWeaponsForTable(),altp);
                $('.weaponDisplayName',altTable).prepend($('<div class="altpModelCounter" />').text(altp.get('isc')));
                $('.weaponDataRow , .wrappedRow',altTable).appendTo(mainTable);
            });
        }
        return mainTable;
    }
    function buildWeaponTable(weapons,model){
        var table=$('<table />');
        buildHeaders(table);
        var weaponList=[];
        $.each(weapons,function(index,weaponName){
            weaponList.push(weaponName);
        });
        weaponList.sort(weaponSortFunction);
        $.each(weaponList,function(index,weaponName){
            var weapon=weaponsByName[weaponName];
            if(weapon){
                buildWeaponRow(model,weapon,table);
            }else{
                log('weapon not found : ',weaponName);
                $('<td />').text(weaponName).appendTo(table).wrap('<tr />');
            }
        });
        return table;
    }
    
    weapons.buildWeaponTable=function(weapons){
        return buildWeaponTable(weapons);
    }
	
    var weaponsInfo=$('#weaponsInfo').bind('click',function(){
        hideWeapons();
    });
	
    weapons.showWeaponsForModel=function(model){
        weaponsInfo.html('');
        buildWeaponTableForModel(model).appendTo(weaponsInfo);
    }
    
    //    var shouldShowWeapons=config.get('weapons.showWeapons');
    var weaponsButton=$('#weaponsButton')
    function showWeapons(){        
        weaponsButton.hide('fast',function(){
            weaponsButton.addClass('hidden').css('display','');
            weaponsInfo.hide().removeClass('hidden').show('fast',function(){
                weaponsInfo.css('display','');
                plugins.onSizeOrLayoutChanged();
            });
        });
        config.set('weapons.showWeapons',true);
    }
    function hideWeapons(){        
        weaponsInfo.hide('fast',function(){
            weaponsInfo.addClass('hidden').css('display','');
            weaponsButton.hide().removeClass('hidden').show('fast',function(){
                weaponsButton.css('display','');
                plugins.onSizeOrLayoutChanged();
            });
        });
        config.set('weapons.showWeapons',false);
    }	
    $('<div />').appendTo('#weaponsButton').text(messages.get('weapons.weaponsButtonTitle')).bind('click',function(){
        showWeapons();
    });
	
    weapons.setRangeUnits=function(value){
        $('#rootContainer').removeClass('showCm').removeClass('showIn').addClass(value);
        config.set('useCm',value=='showCm'?true:false);
    }
    weapons.toggleRangeUnits=function(){
        $('#rootContainer').toggleClass('showCm').toggleClass('showIn');
        config.toggle('useCm');
    }	
    weapons.getRangeUnits=function(){
        return config.get('useCm')?'showCm':'showIn';
    }
	
    if(config.get('useCm')){
        $('#rootContainer').addClass('showCm');
    }else{
        $('#rootContainer').addClass('showIn');
    }
	
    $('#weaponsInfo').attr('title',messages.get('common.clickToHide'));
    
    if(config.get('weapons.showWeapons')){
        $('#weaponsButton').addClass('hidden');
    }else{
        weaponsInfo.addClass('hidden');
    }
	
}());
