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
            
    armyList.printList=function(){
        var printList=armyList.buildHtmlPrintList();
        //        function openPrintPage(){
        //        var rawHtml='<html>'+'<head>'+printList.headHtml+'</head>'+printList.document.html()+'</html>',
        var base64Encoded=$.base64.encode(printList.documentHtml),
        //            urlEncodedHtml=escape(rawHtml),
        //            dataUrl='data:text/html;charset=UTF-8,'+urlEncodedHtml,
        base64DataUrl='data:text/html;charset=UTF-8;base64,'+base64Encoded;
        //            res={
        //                rawHtml:rawHtml,
        //                urlEncodedHtml:urlEncodedHtml,
        //                base64Encoded:base64Encoded,
        //                dataUrl:dataUrl,
        //                base64DataUrl:base64DataUrl
        //            };
        //            log('print page : ',res);
        if(device.hasCordova()){
            log('open print page in mobile browser (cordova)');  // BROKEN!!!
            window.navigator.app.loadUrl(base64DataUrl, {
                openExternal:true
            } ); 
        //window.location.href = base64DataUrl;
        }else{
            log('open print page in new tab');
            window.open(base64DataUrl,'_blank');
        //				if(newPage){
        //					utils.getTinyUrl({
        //						url:listUrl,
        //						success:function(newUrl){
        //							$('<div class="qrCode" />').qrcode({text:newUrl}).replaceAll($('.qrCode',newPage));
        //						}
        //					});
        //				}
        }
    //            window.open(base64DataUrl,'_blank');
    //        };
        
    };
    
    armylist.mailPrintList=function(){
        var printList=armyList.buildHtmlPrintList();
        //        var mailtoUri='mailto:?body='+escape(printList.documentHtml);
        function encodeForEmail(s) {
           // return encodeURIComponent(s.replace(/\r|\n/g, "").replace(/[\x00-\x08]|[\x0B-\x0C]|[\x0E-\x1F]/g, "").replace(/\r\n|\r|\n/g, "\r\n"));
            return encodeURIComponent(s);
        }
        //var mailtoUri='mailto:?subject=text%20mail&body='+encodeForEmail(printList.documentHtml);
        var mailtoUri='mailto:?subject=text%20mail&MIME-Version='+encodeURIComponent('1.0')+'&Content-Type=text/html&body='+encodeForEmail('<html><head></head><body>a <b>test</b></body></html>');
        window.open(mailtoUri,'_blank');
    };
        
    armyList.buildHtmlPrintList=function(){
        var basePath=utils.getBasePath();
        var modelRecords=armyList.getListRecordsAsList();
        var newDoc=$('<html />');
        var headContent='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';
        headContent+='<script type="text/javascript" src="'+(basePath+"js/ia-libs.js")+'" ></script>';
        headContent+='<script type="text/javascript" src="'+(basePath+"js/ia-print.js")+'" ></script>';
        headContent+='<link rel="stylesheet" type="text/css"  href="'+(basePath+"css/style_print.css")+'" ></link>';
        var newBody=$('<body />').appendTo(newDoc);
        var buttons=$('<div id="buttons" />').appendTo(newBody);
		
        function buildMetabootyTable(type){
            var data=ia.data.specs[type],id=utils.newId();
            var container=$('<div class="metabooty metabootyContainer" />');
            $.each(data.list,function(i,roll){
                var spec=data.values[roll],text=messages.get('print.metabooty.'+spec)||names.get('spec',spec)||names.get('bsw',spec)||names.get('ccw',spec)||spec;
                $('<div class="metabootyRecord" />')
                .append($('<input type="radio" class="metabootyCheckbox" />').attr('name',id))
                .append($('<div class="metabootyRoll" />').text(roll))
                .append($('<div class="metabootySpec" />').text(text))
                .appendTo(container);
            });
            return container;
        }
        
        function addCheckbox(config){
            var checkbox=$('<input type="checkbox" '+(config.defaultOn?'checked="checked"':'')+' ></input>');
            var checkboxLabel=$('<span class="checkboxLabel" />').text(config.label);
            checkbox.attr('onClick',config.onclick);
            $('<div class="printConfigCheckboxWrapper" />')
            .append(checkbox)
            .append(checkboxLabel)
            .appendTo(buttons);
        }
        
        $('<input type="button" onClick="window.print()" value="PRINT" class="printButton" />').val(messages.get('print.buttonLabel.print')).appendTo(buttons);
        
        $.each([{
            label:messages.get('print.buttonLabel.qrcode'),
            onclick:'$(\'img.qrCode\').toggle()',
            defaultOn:false
        },{
            label:messages.get('print.buttonLabel.profiles'),
            onclick:'$(\'.modelProfile\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.specs'),
            onclick:'$(\'.specsContainer\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.info'),
            onclick:'$(\'.listInfo\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.models'),
            onclick:'$(\'.modelContainer , .groupMark\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.aweapons'),
            onclick:'$(\'.allWeapons\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.mweapons'),
            onclick:'$(\'.modelWeapons\').toggle()',
            defaultOn:false
        },{
            label:messages.get('print.buttonLabel.icons'),
            onclick:'$(\'.flagIcons\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.depletables'),
            onclick:'$(\'.limitedUses\').toggle()',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.colors'),
            onclick:'$(\'body\').toggleClass(\'grayscalePrint\')',
            defaultOn:true
        },{
            label:messages.get('print.buttonLabel.metabooty'),
            onclick:'$(\'.metabooty\').toggle()',
            defaultOn:true
        }],function(i,config){
            addCheckbox(config);
        })
        
        if(campaign.isEnabled()){
            addCheckbox({
                label:messages.get('print.buttonLabel.campaignspecs'),
                onclick:'$(\'.campaignSpecs\').toggle()',
                defaultOn:true
            });
        }
        //        $('<input type="button" onClick="$(\'img.qrCode\').toggle()" value="TOGGLE QRCODE" />').val(messages.get('print.buttonLabel.qrcode')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.modelProfile\').toggle()" value="TOGGLE PROFILES" />').val(messages.get('print.buttonLabel.profiles')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.specsContainer\').toggle()" value="TOGGLE SPECS" />').val(messages.get('print.buttonLabel.specs')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.listInfo\').toggle()" value="TOGGLE INFO" />').val(messages.get('print.buttonLabel.info')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.modelContainer , .groupMark\').toggle()" value="TOGGLE MODELS" />').val(messages.get('print.buttonLabel.models')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.allWeapons\').toggle()" value="TOGGLE ALL WEAPONS" />').val(messages.get('print.buttonLabel.aweapons')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.modelWeapons\').toggle()" value="TOGGLE MODEL WEAPONS" />').val(messages.get('print.buttonLabel.mweapons')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.flagIcons\').toggle()" value="TOGGLE ICONS" />').val(messages.get('print.buttonLabel.icons')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'.limitedUses\').toggle()" value="TOGGLE DEPLETABLES CHECKBOXES" />').val(messages.get('print.buttonLabel.depletables')).appendTo(buttons);
        //        $('<input type="button" onClick="$(\'body\').toggleClass(\'grayscalePrint\')" value="TOGGLE COLORS" />').val(messages.get('print.buttonLabel.colors')).appendTo(buttons);
        
                
        var listHeader=$('<div id="listHeader" />').appendTo(newBody);
        var listInfoWrapper=$('<div id="listCost" />').appendTo(listHeader);
        $('<div class="listInfo"/>').text(armyList.pointCount+' points | '+armyList.swcCount+' swc ( '+armyList.modelCount+' models )').appendTo(listInfoWrapper);
        var shortUrlContainer=$('<div class="shortUrlContainer" />').appendTo(listInfoWrapper);
        $('<h1/>').text(units.getFactionNameDisplay()+(units.sectorialName?(' - '+units.getSectorialNameDisplay()):'')).prepend($('<img />').attr('src',basePath+units.logoPath)).appendTo(listHeader);
        
        //        var alreadyPrintedProfileByIsc={};
                
        var allWeapons={};
        
        //        var alreadyPrintedWeaponsIscCode={};
        var lastModel={
            parent:{}
        };
		
        $.each(modelRecords,function(index,listRecord){
            var model=listRecord.model;
                        
            $.each(model.getAllWeapons(),function(x,weapon){
                allWeapons[weapon]=weapon;
            });
            allWeapons['Discover']='Discover';
                        
            var modelContainer=$('<div class="modelContainer" />').appendTo(newBody);
            //			var modelHeader=$('<div class="modelHeader" />').appendTo(modelContainer);
            var modelHeader=modelContainer;
            var modelNames=$('<div class="modelNames" />').appendTo(modelHeader);
            $('<div />').append($('<img />').attr('src',basePath+utils.buildImagePath(model.get('isc'),'logo_small'))).appendTo(modelNames);
            var flagIcons=$('<div class="flagIcons" />').appendTo(modelNames);
            units.addFlagIcons(model,flagIcons);
            $('<div class="modelIsc" />').text(model.getDisplay('isc')).appendTo(modelNames);
            modelNames.append(' - ');
            $('<div class="modelCode" />').text(model.getDisplay('codename')).appendTo(modelNames);
			var modelTypeAndCostWrapper=$('<div class="modelTypeAndCostWrapper" />').appendTo(modelHeader);
			$('<div class="modelType" />').text(model.getDisplay('type')).appendTo(modelTypeAndCostWrapper);
            if(!model.parent.isPseudoUnit){
                $('<div class="modelCost" />').text('('+model.cost+'|'+model.swc+')').appendTo(modelTypeAndCostWrapper);
            }
            if(lastModel.parent.isc!=model.parent.isc){
                //                alreadyPrintedProfileByIsc[model.parent.isc]=true;
                var table=$('<table class="modelProfile"/>').appendTo(modelContainer),header=$('<tr />').appendTo(table),row=$('<tr />').appendTo(table);
                $.each(["mov","cc","bs","ph","wip","arm","bts","w","ava"],function(index,attr){
                    $('<th />').text(messages.get('units.attribute.'+(attr=='w'?model.getWoundType():attr))).appendTo(header);
                    $('<td />').text(model.getDisplay(attr)).addClass(attr+'Attr').appendTo(row);
                });
                if(model.parent.altp){
                    $.each(model.parent.altp,function(i,altp){
                        $('<tr />').addClass('altpHeaderIsc').append($('<td colspan="9"/>').text(altp.isc+' :')).appendTo(table);
                        var row=$('<tr />').appendTo(table);
                        $.each(["mov","cc","bs","ph","wip","arm","bts","w","ava"],function(index,attr){
                            $('<td />').text(altp[attr]?altp[attr]:'').addClass(attr+'Attr').appendTo(row);
                        });
                    });
                }
            }
            
            names.createCmAttrForMov(modelContainer);
            //var specs=model.getAllSpec().join(', '),weapons=model.getAllWeapons().join(', ');
            //var text=specs+((specs!=''&&weapons!='')?' - ':'')+weapons;
            var allSpecs=model.getAllSpec();
            if(lastModel.parent.isc!=model.parent.isc || lastModel.code!=model.code){
                var allSpecsStr=model.getAllSpecDisplay(),bswDisplay=model.getDisplay('bsw'),ccwDisplay=(bswDisplay.length>0?', ':'')+model.getDisplay('ccw');
                $('<div class="specsContainer" />').text(allSpecsStr)
                .append($('<span class="modelWeapons" />').text((allSpecsStr.length>0?', ':'')+bswDisplay+ccwDisplay)).appendTo(modelContainer);
                $('<div class="modelWeapons" />').append(weapons.buildWeaponTableForModel(model).addClass('modelWeaponsTable')).appendTo(modelContainer).hide();
            }
            //$('<div class="weaponsContainer" />').text(model.getAllWeapons().join(', ')).appendTo(modelContainer);
        
            var limitedUsesItems=[];
            $.each(model.getAllWeapons(),function(i,weaponName){
                var weapon=weapons.weaponsByName[weaponName];
                if(weapon && weapon.uses){
                    limitedUsesItems.push({
                        name: weapon.getDisplay('name'),
                        uses:Number(weapon.uses)
                    });
                }
            });     
            $.each([{
                name:'Deployable Repeater',
                uses:3
            },{
                name:'Nullifier',
                uses:3
            }],function(i,item){
                if(allSpecs[item.name]){
                    limitedUsesItems.push(item);
                }            
            });
        
            //TODO process specs
            if(limitedUsesItems.length>0){
                //            var limitedUsesContainer=$('<div class="limitedUses" />').append($('<div />').text('remaining ammo/uses for:')).appendTo(modelContainer);
                var limitedUsesContainer=$('<div class="limitedUses" />').appendTo(modelContainer);
                $.each(limitedUsesItems,function(i,item){
                    var limitedUsesRow=$('<div class="limitedUsesRow" />').appendTo(limitedUsesContainer);
                    //                    $('<div class="usesCheckboxesLabel" />').text(weapon.getDisplay('name')).appendTo(limitedUsesRow);
                    $('<div class="usesCheckboxesLabel1" />').text(item.name).appendTo(limitedUsesRow);
                    $('<div class="usesCheckboxesLabel2" />').text(' ('+item.uses+') ').appendTo(limitedUsesRow);
                    var usesCheckboxes=$('<div class="usesCheckboxes" />').appendTo(limitedUsesRow);
                    var i;
                    for(i=0;i<item.uses;i++){
                        usesCheckboxes.append('<input type="checkbox" class="limitedUsesCheckbox"/>');
                    }
                });
            }
			
            if(model.get('spec')['MetaChemistry']){
                buildMetabootyTable('metachemistry').appendTo(modelContainer);
            }
            if(model.get('spec')['Booty']){
                buildMetabootyTable('booty').appendTo(modelContainer);
            }
        
            lastModel=model;
        });
                
        $.each(armyList.getGroupMarks(),function(markIndex,pos){
            $('.modelContainer',newBody).eq(pos).before($('<div class="groupMark"></div>').text(messages.get('armylist.groups.groupTitle')+(markIndex+1)));
        });
		
        function buildQrCode(url){
            var qrHolder=$('<div />');
            try{
                qrHolder.qrcode({
                    text:url
                });
            }catch(e){
                log('qrcode error',e);
            }
            var qrData=$('canvas',qrHolder)[0].toDataURL("image/png");
            $('.qrCode',newBody).attr('src',qrData);
        }    
       
        //WEAPON TABLE
        var weaponTable=weapons.buildWeaponTable(allWeapons);
        weaponTable.addClass('allWeapons').appendTo(newBody);  
        
        newBody.addClass(weapons.getRangeUnits());
        //END WEAPON TABLE
        
        //CAMPAIGN SPECS
        var campaignSpecs=$('<table class="campaignSpecs" />').appendTo(newBody);
        if(campaign.isEnabled()){
            $('<tr  />').append($('<th class="campaignSpecsTitle" colspan="2"/>').text(messages.get('campaign.specsprint.title'))).appendTo(campaignSpecs);
            $.each([].concat(campaign.skillCategories).concat(['ltident']),function(i,category){
                var level=campaign.militarySpecs[category];
                if(level){
                    $('<tr class="militarySpec" />')
                    .append($('<td class="levelLabel" />').text(messages.get('campaign.militaryspecs.'+category+'.title')+' '+messages.get('campaign.militaryspecs.level'+level+'.title')))
                    .append($('<td class="specDesc" />').text(messages.get('campaign.militaryspecs.'+category+'.level'+level+'.descTotal')||messages.get('campaign.militaryspecs.'+category+'.level'+level+'.desc')))
                    .appendTo(campaignSpecs);
                }
            });
            $('<tr  />').append($('<th class="totalXpCost"  colspan="2"/>')
                .text(messages.get('campaign.totalXpCost'))
                .append($('<span class="costValue" />').text(campaign.xpSpentTotal))
                )
            .appendTo(campaignSpecs);
        }
        //END CAMPAIGN SPECS
        
        //QRCODE
        $('<img class="qrCode" />').appendTo(newBody).hide();
        
        $('<div class="tailAdvice" />').text(messages.get('print.bgAdvice')).appendTo(newBody);  
        
        //        var rawHtml='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n'+
        //            $('<temporaryWrapper />').append(newDoc).html(),
        

        
        var listUrl=armyList.exportListUrl();
        utils.getTinyUrl({
            url:listUrl,
            success:function(newUrl){
                buildQrCode(newUrl);
                //                shortUrlContainer.append($('<a />').attr('href',newUrl).text(newUrl));
                shortUrlContainer.text(newUrl);
            },
            error:function(){
                buildQrCode(listUrl);    
            },
            ajaxConfig:{
                timeout:1000,
                async:false
            }
        });
                
        return {
            headHtml:headContent,
            document:newDoc,
            body:newBody,
            documentHtml:'<html>'+'<head>'+headContent+'</head>'+newDoc.html()+'</html>'
        };
        
    //		openPrintPage();
    };
    
//	armyList.printList=function(){
//		armyList.buildPrintableListPage();
//	};
        
})();