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

var wiki=ia.wiki={};

(function(){
    
    var currentLang=config.get('wiki.lang')||'en';
    var availableLangs=[],baseUrlByLang={};
    var setLang=wiki.setLang=function(lang){
        log('setting wiki lang to : ',lang);
        config.set('wiki.lang',currentLang=lang);
        //        searchAndShowResults($('#rulesSearchField input').val());
        clearWiki();
        updateLangFlag();
    }
    wiki.getLang=function(){
        return currentLang;
    }
    wiki.getAvailableLangs=function(){
        return availableLangs;
    }
    var nextLang=wiki.nextLang=function(){
        var currentIndex=$.inArray(currentLang,availableLangs),nextIndex=(++currentIndex)<availableLangs.length?currentIndex:0,nextLang=availableLangs[nextIndex];
        setLang(nextLang);
    }
    
    function clearWiki(){
        hidePage();
        $('#rulesSearchField input').val('');
        $('#rulesSearchResults').html('');
    }
    
    function cleanText(text){
        return text.toLowerCase().replace(/[^a-z0-9]/g,'');
    }
    
    var pagesByLangAndMatch=wiki.pagesByLangAndMatch={};
    $.each(data.wiki,function(i,langGroup){
        var lang=langGroup.lang;
        //        var remote=langGroup.remote;
        //        availableLangs[lang]=lang;
        availableLangs.push(lang);
        pagesByLangAndMatch[lang]=pagesByLangAndMatch[lang]||{};
        baseUrlByLang[lang]=langGroup.baseurl;
        $.each(langGroup.pages,function(i,page){
            var pageName=page.pagename,pageMatch=cleanText(pageName);
            pagesByLangAndMatch[lang][pageMatch]={
                name:pageName,
                match:pageMatch,
                fileName:page.filename,
                displayName:pageName.replace(/_+/g,' '),
                remote:page.remote||langGroup.remote||false
            };
        });
    //		var pageName=$(this).text(),pageMatch=cleanText(pageName);
    //		pagesByMatch[pageMatch]={
    //			name:pageName,
    //			match:pageMatch,
    //			fileName:$(this).attr('fileName'),
    //			displayName:pageName.replace(/_+/g,' ')
    //		};
    });
    var langButton=$('<div class="rulesButton"><img/></div>').appendTo('#rulesButtons').bind('click',function(){
        nextLang();
    });
    function updateLangFlag(){
        $('img',langButton).attr('src','images/flag_'+currentLang+'.png').attr('title',currentLang);
    }
    updateLangFlag();
    
    $('<div class="rulesButton" />').text(messages.get('wiki.buttons.back')).appendTo('#rulesButtons').bind('click',function(){
        $('#rootContainer').show();
        $('#rulesBrowser').hide();
    });
    $('<div class="rulesButton" />').text(messages.get('wiki.buttons.liveWiki')).appendTo('#rulesButtons').bind('click',function(){
        var sel=$('#rulesSearchResults .ruleMatch.selected');
        if(sel.length>0){
            sel=sel.text();
        }else{
            sel=$('#rulesSearchField input').val();
        }
        var url=baseUrlByLang[currentLang]||'http://infinitythegame.wikispot.org';
        if(sel&&sel.length>0){
            window.open(url+'/Home?action=search&inline_string='+escape(sel));              
        } else{
            window.open(url);       
        }
    });
    
    $('#rulesSearchField input').bind('change keyup',function(){
        searchAndShowResults($('#rulesSearchField input').val());
    });
    
    function searchAndShowResults(pattern){
        var match=cleanText(pattern);
        var exactMatch=pagesByLangAndMatch[currentLang][match];
        var regexp=new RegExp(match);
        var otherMatches=exactMatch?[exactMatch]:[];
        $.each(pagesByLangAndMatch[currentLang],function(pageMatch,page){
            if(regexp.test(pageMatch)&&pageMatch!=match){
                otherMatches.push(page);
            }
        });
        $('#rulesSearchResults').html('');
        $('#rulesText iframe').attr('src','');
        if(otherMatches.length>0){
            $.each(otherMatches,function(index,page){
                var ruleButton=$('<div class="ruleMatch" />').text(page.displayName).bind('click',function(){
                    $('#rulesSearchResults .ruleMatch.selected').removeClass('selected');
                    ruleButton.addClass('selected');
                    showPage(page);
                }).appendTo('#rulesSearchResults');
            });
            if(!window.cordova){ //fix for buggy iframe
                showPage(otherMatches[0]);
            }
            $('#rulesSearchResults .ruleMatch:first-child').addClass('selected');
        }
    }
	
    //    var iframe=$('#rulesText iframe');
    //    iframe.bind('load',function(){
    //        if(iframe.attr("src")!=""){
    //  //          log('adding disclamer info to iframe content');
    //            iframe.contents().find('body').append(messages.get('wiki.disclamerHtml'));
    //        }
    //    });
    
    function showPage(page){
        //  var lang='en';
        var basePath=page.remote?utils.getAbsoluteBasePath():utils.getBasePath();
        var wikiPath=basePath+'wiki_'+currentLang+'/';
        var path=wikiPath+page.fileName;
        //        log('opening wiki url ',path);
        //        iframe.attr('src',path);
        log('opening wiki url (embedding) ',path);
        loadPage(path,wikiPath);        
    }
    function loadPage(path,wikiPath){
        if(path.match('^.*[0-9]+[.]html#.*$')){
            var bookmark=path.replace(/^[^#]+#/,'');
            path=path.replace(/#.*$/,'');
        }
        $.ajax({
            url:path,
            async:false,
            dataType:'html',
            success:function(data){
                //     log('showing wiki data : ',data);
                $('#rulesText').hide().html(data).append(messages.get('wiki.disclamerHtml'));
                $('#rulesText img').each(function(){
                    var node=$(this);
                    node.attr('src',wikiPath+node.attr('src'));
                });
                $('#rulesText a').each(function(){
                    var node=$(this),target=node.attr('href');
                    if(target.match('^[0-9]+[.]html(#.*)?$')){
                        //                        log('overriding link ',target);
                        node.bind('click',function(event){
                            event.preventDefault();
                            loadPage(wikiPath+target,wikiPath);
                            return false;
                        });
                    }else {
                        var pattern=cleanText(target),page=pagesByLangAndMatch[currentLang][pattern];
                        if(page){
                            //                            log('replacing link ',target,' with page ',page);
                            node.bind('click',function(event){
                                event.preventDefault();
                                showPage(page);
                                return false;
                            });
                        }else{
                            //                            log('skipping external link ',target);
                            node.css('color','red !important');
                            node.attr('title',"external link to : "+node.attr('title'));
                        }
                    }
                //                   node.attr('src',wikiPath+node.attr('src'));
                });
                $('#rulesText').show();
                if(bookmark){
                    $('#rulesText #'+bookmark)[0].scrollIntoView();
                }
                wikiScroller.updateScroll(true);
            }
        });
    }
	
    function hidePage(){
        //iframe.attr('src','');
        $('#rulesText').html('');
    }
	
    //    document.addEventListener("backbutton", function(){
    //        hidePage();
    //    }, false);
    
    wiki.searchWiki=function(value){
        $('#rulesBrowser').show();
        if(value){
            $('#rulesSearchField input').val(value);
            searchAndShowResults(value);
        }
    };
    
    var wikiScroller=utils.createScroll({
        getScrollWrapper:function(){
            return $('#rulesScrollWrapper');
        },
        getAvailableHeight:function(){
            //                    return $(window).height()-$('#savedLists').outerHeight(true)+this.getExpectedHeight();
            //            return $(window).height()-40; // should be 38
            return $(window).height()
            -($('#rulesBrowser').outerHeight(true)-$('#rulesScrollWrapper').height())
            +1;
        },
        getExpectedHeight:function(){
            return $('#rulesScrollWrapper > *').outerHeight(false);
        },
        name:'wikiScroller'
    //                beforeEnable:function(){
    ////                    $('#modelChooserContainerScrollWrapper .modelButton').draggable('disable');
    //                },
    //                afterDisable:function(){
    //                    $('#modelChooserContainerScrollWrapper .modelButton').draggable('enable');
    //                }
    });
    
}());