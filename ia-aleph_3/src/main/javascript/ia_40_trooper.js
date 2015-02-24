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

(function () {

    Handlebars.registerHelper("joinForTrooperOption", function (context) {
        var res = '';
        if (context.skills.length > 0) {
            res += ' ' + context.skills.join(', ');
        }
        if (context.equipments.length > 0) {
            res += ' (' + context.equipments.join(', ') + ')';

        }
        return res;
    });
    Handlebars.registerHelper("trooperEquipments", function (context) {
        if (context.equipments.length > 0) {
            return 'Equipment: ' + context.equipments.join(' · ');
        } else {
            return '';
        }
    });
    Handlebars.registerHelper("trooperSkills", function (context) {
        if (context.skills.length > 0) {
            return 'Special Skills: ' + context.skills.join(' · ');
        } else {
            return '';
        }
    });
    Handlebars.registerHelper("trooperAvailableAva", function (context) {
        if (context.hasLimitedAva) {
            var availableAva = roster.getAvailableAvaByTrooperCode(context.code);
            //TODO 
//            if (availableAva !== context.ava) {
//                return availableAva + ' (' + context.ava + ')';
//                return availableAva + ' (' + context.ava + ')';
//            } else {
            return context.ava;
//            }
        } else {
            return context.ava;
        }
    });
    Handlebars.registerHelper("trooperCompositeCost", function (context) {
        return context.isHeadOfCompositeUnit ? ' (' + context.getCompositeCost() + ')' : '';
    });
    Handlebars.registerHelper("trooperCompositeSwc", function (context) {
        return (context.isHeadOfCompositeUnit && context.getCompositeSwc() !== context.swc) ? ' (' + context.getCompositeSwc() + ')' : '';
    });

    var trooperSelectorTemplate = Handlebars.compile($('#ia-trooperSelectorTemplate').html());

    var skillsWithReferenceTable = {
        'MetaChemistry': 'metachemistry'
    };
    var referenceTableTemplates = {};

    function buildTrooperSelector(trooper) {
        var trooperSelector = $(trooperSelectorTemplate({
            trooper: trooper,
            faction: trooper.getFaction(),
            messages: {
                name: 'Name',
                bsw: "BS Weapons",
                ccw: "CC Weapons",
                swc: "SWC",
                cost: "C",
                mov: 'MOV',
                cc: 'CC',
                bs: 'BS',
                ph: "PH",
                wip: "WIP",
                arm: "ARM",
                bts: "BTS",
                wounds: "W",
                str: "STR",
                silhouette: "S",
                ava: "AVA"
            }
        }));
        $.each(skillsWithReferenceTable, function (skill, table) {
            if (trooper.hasSkillOrEquipment(skill)) {
                if (!referenceTableTemplates[table]) {
                    referenceTableTemplates[table] = Handlebars.compile($('#ia-referenceTableTemplate-' + table).html());
                }
                trooperSelector.append(referenceTableTemplates[table]({reference: data.getReferenceTableData(table)}));
            }
        });
        return trooperSelector;
    }

    ui.trooperSelector = {
        updateTrooperSelector: function (trooperCode, optionCode) {
            trooperCode = trooperCode || data.getTroopers()[0].code;
            var trooper = data.findTrooperByCode(trooperCode);
            if (trooper.isPartOfCompositeUnit && !trooper.isHeadOfCompositeUnit) {
                this.updateTrooperSelector(trooper.compositeUnitHeadTrooperCode);
                return;
            }
            var profilesToRender = [trooper];

//            if (trooper.otherprofiles) {
            $.each(trooper.otherprofiles || [], function (i, otherprofileCode) {
                var otherProfile = data.findTrooperByCode(otherprofileCode);
                if (otherProfile.profileorder === 0) {
                    profilesToRender.unshift(otherProfile);
                } else {
                    profilesToRender.push(otherProfile);
                }
//                    buildTrooperSelector(otherProfile).addClass('ia-trooperSelectorOtherProfile')
//                            .appendTo(otherProfile.hasOptions ? '#ia-trooperSelectorWrapper' : trooperSelector.find('.ia-trooperSelectorOtherProfilesContainer'));
            });
//                addSelectListener($('#ia-mainScreenCenter .ia-trooperSelectorOtherProfile'), function (trooper) {
//                    addTrooper(trooper);
//                });
//            }
            $('#ia-trooperSelectorWrapper').empty();
            $.each(profilesToRender, function (i, profile) {
                var trooperSelector = buildTrooperSelector(profile).addClass(profile.isSlaveOption() ? 'ia-trooperSelectorOtherProfile' : 'ia-trooperSelectorMainProfile');
                if (!profile.hasOptions && i > 0) {
                    $('#ia-trooperSelectorWrapper .ia-trooperSelectorContainer:first .ia-trooperSelectorOtherProfilesContainer').append(trooperSelector);
                } else {
                    $('#ia-trooperSelectorWrapper').append(trooperSelector);
                    trooperSelector.find('.ia-trooperSelectorOptionRow').on('click', function () {
                        var trooper = profile.findTrooperOptionByCode(Number($(this).data('ia-optioncode')));
                        if ($(this).hasClass('ia-selected')) {
                            if (!trooper.isSlaveOption()) {
                                roster.addTrooper(trooper);
                            }
                        } else {
                            $('#ia-mainScreenCenter .ia-trooperSelectorOptionList .ia-selected').removeClass('ia-selected');
                            $(this).addClass('ia-selected');
                            ui.weaponsDisplay.updateWeaponsDisplayForTrooper(trooper);
                            ui.infoDisplay.updateInfoDisplayForTrooper(trooper);
                        }
                    });
                }
//                addSelectListener(trooperSelector, function (trooper) {
//                if (!trooper.isSlaveOption()) {
//                    roster.addTrooper(trooper);
//                }
////                    addTrooper(trooper);
//                });
            });
//            var trooperSelector = buildTrooperSelector(trooper);
//            $('#ia-trooperSelectorWrapper').html(trooperSelector);

//            function addSelectListener(context, callback) {
//                context.find('.ia-trooperSelectorOptionRow').on('click', function () {
//                    var trooper = data.findTrooperByCode(Number($(this).closest('.ia-trooperSelectorContainer').data('ia-troopercode'))).findTrooperOptionByCode(Number($(this).data('ia-optioncode')));
//                    if ($(this).hasClass('ia-selected')) {
//                        callback(trooper);
//                    } else {
//                        $('#ia-mainScreenCenter .ia-trooperSelectorOptionList .ia-selected').removeClass('ia-selected');
//                        $(this).addClass('ia-selected');
//                        ui.weaponsDisplay.updateWeaponsDisplayForTrooper(trooper);
//                        ui.infoDisplay.updateInfoDisplayForTrooper(trooper);
//                    }
//                });
//            }
//            function addTrooper(trooper) {
//                if (!trooper.isSlaveOption()) {
//                    roster.addTrooper(trooper);
//                }
//            }
//            addSelectListener(trooperSelector, function (trooper) {
//                addTrooper(trooper);
//                //TODO update view (ava) after add
//            });

//            if (trooper.otherprofiles) {
//                $.each(trooper.otherprofiles, function (i, otherprofileCode) {
//                    var otherProfile = data.findTrooperByCode(otherprofileCode);
//                    buildTrooperSelector(otherProfile).addClass('ia-trooperSelectorOtherProfile')
//                            .appendTo(otherProfile.hasOptions ? '#ia-trooperSelectorWrapper' : trooperSelector.find('.ia-trooperSelectorOtherProfilesContainer'));
//                });
//                addSelectListener($('#ia-mainScreenCenter .ia-trooperSelectorOtherProfile'), function (trooper) {
//                    addTrooper(trooper);
//                });
//            }
            if (!optionCode) {
                $('#ia-mainScreenCenter .ia-trooperSelectorMainProfile .ia-trooperSelectorOptionRow').first().trigger('click');
            } else {
                $('#ia-mainScreenCenter .ia-trooperSelectorMainProfile .ia-trooperSelectorOptionRow-' + optionCode).trigger('click');
            }
        },
        enableTrooperSelectorLogoSelector: function () {
            var lastSelected = this.getSelectedTrooperLogo();
            this.disableTrooperSelectorLogoSelector();
            var selectedTrooper = this.getSelectedTrooperOption();
            log('enable logo selector for troop = ', selectedTrooper);
            $('#ia-trooperSelectorWrapper .ia-trooperSelectorContainer').each(function () {
                var trooper = data.findTrooperByCode(Number($(this).data('ia-troopercode')));
                if (!trooper.hasOptions || trooper.troopercode === selectedTrooper.troopercode) {
                    $('.ia-trooperSelectorMain:first', this).addClass('ia-trooperLogoSelectionMode');
                    if (lastSelected && lastSelected.troopercode === trooper.troopercode) {
                        $('.ia-trooperSelectorMain:first', this).addClass('ia-selected');
                    }
                }
            });
            if ($('#ia-trooperSelectorWrapper .ia-trooperSelectorMain.ia-selected').length === 0) {
                $('#ia-trooperSelectorWrapper .ia-trooperSelectorContainer-' + selectedTrooper.troopercode + ' .ia-trooperSelectorMain:first').addClass('ia-selected');
            }
            $('#ia-trooperSelectorWrapper .ia-trooperSelectorMain.ia-trooperLogoSelectionMode .ia-trooperSelectorLogoSelectorOverlay').on('click', function () {
                log('selected trooper logo = ', $(this).closest('.ia-trooperSelectorContainer').data('ia-troopercode'));
                $('#ia-trooperSelectorWrapper .ia-trooperSelectorMain.ia-selected').removeClass('ia-selected');
                $(this).closest('.ia-trooperSelectorMain').addClass('ia-selected');
                ui.weaponsDisplay.updateWeaponsDisplayForTrooper();
            });
        },
        disableTrooperSelectorLogoSelector: function () {
            log('disable logo selector');
            $('#ia-trooperSelectorWrapper .ia-trooperSelectorMain').removeClass('ia-trooperLogoSelectionMode');
            $('#ia-trooperSelectorWrapper .ia-trooperSelectorMain.ia-selected').removeClass('ia-selected');
            $('#ia-trooperSelectorWrapper .ia-trooperSelectorLogoSelectorOverlay').off('click');
        },
        getSelectedTrooperLogo: function () {
            return data.findTrooperByCode(Number($('#ia-trooperSelectorWrapper .ia-trooperSelectorMain.ia-selected').closest('.ia-trooperSelectorContainer').data('ia-troopercode')));
        },
        getSelectedTrooperOption: function () {
            return data.findTrooperByCode(Number($('#ia-trooperSelectorWrapper .ia-trooperSelectorOptionRow.ia-selected').closest('.ia-trooperSelectorContainer').data('ia-troopercode')));
        }
    };


})();