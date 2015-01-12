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
            if (availableAva !== context.ava) {
                return availableAva + ' (' + context.ava + ')';
            } else {
                return context.ava;
            }
        } else {
            return context.ava;
        }
    });

    var trooperSelectorTemplate = Handlebars.compile($('#ia-trooperSelectorTemplate').html());

    var skillsWithReferenceTable = {
        'MetaChemistry': 'metachemistry'
    };
    var referenceTableTemplates = {};

    function buildTrooperSelector(trooper) {
        var trooperSelector = $(trooperSelectorTemplate({
            trooper: trooper,
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
            var trooperSelector = buildTrooperSelector(trooper);
            $('#ia-trooperSelectorWrapper').html(trooperSelector);

            function addSelectListener(context, callback) {
                context.find('.ia-trooperSelectorOptionRow').on('click', function () {
                    var trooper = data.findTrooperByCode(Number($(this).closest('.ia-trooperSelectorContainer').data('ia-troopercode'))).findTrooperOptionByCode(Number($(this).data('ia-optioncode')));
                    if ($(this).hasClass('ia-selected')) {
                        callback(trooper);
                    } else {
                        $('#ia-mainScreenCenter .ia-trooperSelectorContainer .ia-selected').removeClass('ia-selected');
                        $(this).addClass('ia-selected');
                        ui.weaponsDisplay.updateWeaponsDisplayForTrooper(trooper);
                    }
                });
            }
            addSelectListener(trooperSelector, function (trooper) {
                roster.addTrooper(trooper);
                //TODO update view (ava) after add
            });
            if (!optionCode) {
                $('#ia-mainScreenCenter .ia-trooperSelectorOptionRow').first().trigger('click');
            } else {
                $('#ia-mainScreenCenter .ia-trooperSelectorOptionRow-' + optionCode).trigger('click');
            }
            if (trooper.otherprofiles) {
                $.each(trooper.otherprofiles, function (i, otherprofileCode) {
                    var otherProfile = data.findTrooperByCode(otherprofileCode);
                    buildTrooperSelector(otherProfile).addClass('ia-trooperSelectorOtherProfile')
                            .appendTo(otherProfile.hasOptions ? '#ia-mainScreenCenter' : trooperSelector.find('.ia-trooperSelectorOtherProfilesContainer'));
                });
                addSelectListener($('#ia-mainScreenCenter .ia-trooperSelectorOtherProfile'), function (trooper) {
                });

            }
        }
    };


})();