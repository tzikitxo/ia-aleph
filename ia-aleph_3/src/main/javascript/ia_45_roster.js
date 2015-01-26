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

var roster = ia.roster = {};

(function () {

    var rosterData = {
        troopers: [],
        pointCap: 300,
        swcCap: 6,
        trooperCount: 0,
        factionCode: null
    };

    function updateRosterData(config) {
        $.extend(rosterData, config);
    }
    function addTrooper(trooper) {
        rosterData.troopers.push($.extend({
            rosterentrycode: getNextRosterEntryCode()
        }, trooper));
    }
    function validateAndSave() {
        validateRoster();
        storage.saveRoster(roster.serializeRosterData());
        ui.armyRoster.updateArmyRoster();
    }

    roster.updateRosterData = function (config) {
        updateRosterData(config);
        validateAndSave();
    };
//    roster.clearRosterTroopers = function () {
//        rosterData.troopers = [];
//        validateRoster();
//        ui.armyRoster.updateArmyRoster();
//    };
    roster.getRosterData = function () {
        return rosterData;
    };
    function getNextRosterEntryCode() {
        var n = 0;
        $.each(rosterData.troopers, function (i, trooper) {
            n = Math.max(trooper.rosterentrycode, n);
        });
        return n + 1;
    }
    roster.addTrooper = function (trooper) {
        addTrooper(trooper);
        validateAndSave();
    };
    roster.removeTrooperByIndex = function (trooperIndex) {
        rosterData.troopers.splice(trooperIndex, 1);
        validateAndSave();
    };
    roster.getAvailableAvaByTrooperCode = function (trooperCode) {
        var trooper = data.findTrooperByCode(trooperCode);
        if (!trooper.hasLimitedAva) {
            return trooper.ava;
        } else {
            return trooper.ava - (rosterData.trooperCountByCode[trooperCode] || 0);
        }
    };
    roster.serializeRosterData = function () {
        var str = 'F' + rosterData.factionCode + 'P' + rosterData.pointCap + 'S' + rosterData.swcCap;
        $.each(rosterData.troopers, function (i, trooper) {
            str += 'T' + trooper.troopercode + 'O' + trooper.optioncode;
        });
        return str;
    };
    roster.loadRosterData = function (str) {
        var factionCode = Number(str.replace(/.*F([0-9]+).*$/, '$1')),
                pcap = Number(str.replace(/.*P([0-9]+).*$/, '$1')),
                swcap = Number(str.replace(/.*S([0-9.]+).*$/, '$1'));
        //TODO check data

        if (!data.findFactionOrSectorialByCode(factionCode)) {
            throw "faction not found for code = " + factionCode;
        }

        data.loadTroopersByFaction(factionCode);
        updateRosterData({
            pointCap: pcap,
            swcCap: swcap,
            factionCode: factionCode
        });
        if (str.match(/T/)) {
            $.each(str.replace(/^.*?T/, '').split('T'), function (i, tr) {
                var troopcode = Number(tr.split(/O/)[0]), optioncode = Number(tr.split(/O/)[1]);
                var trooper = data.findTrooperByCode(troopcode).findTrooperOptionByCode(optioncode);
                addTrooper(trooper);
            });
        }
        validateRoster();
        ui.armyRoster.updateArmyRoster();
    };
    function validateRoster() {
        rosterData.pointCount = 0;
        rosterData.swcCount = 0;
        rosterData.trooperCount = 0;
        rosterData.orderCount = 0;
        rosterData.warningMessages = [];

        var hasHacker = false, ltCount = 0, needHacker = false;
        rosterData.trooperCountByCode = {};
        $.each(rosterData.troopers, function (i, trooper) {
            rosterData.pointCount += Number(trooper.cost) || 0;
            rosterData.swcCount += Number(trooper.swc) || 0;
            rosterData.trooperCount++;
            if (trooper.type === 'REM') {
                needHacker = true;
            }
            if (trooper.hasSkillOrEquipment('Hacker')) {
                hasHacker = true;
            }
            if (!trooper.hasSkillOrEquipment('G: Servant')
                    && !trooper.hasSkillOrEquipment('G: Synchronized')) {
                rosterData.orderCount++;
            }
            if (trooper.hasSkillOrEquipment('Lieutenant')) {
                ltCount++;
            }
            if (!rosterData.trooperCountByCode[trooper.troopercode]) {
                rosterData.trooperCountByCode[trooper.troopercode] = 1;
            } else {
                rosterData.trooperCountByCode[trooper.troopercode]++;
            }
        });
        rosterData.pointDiff = rosterData.pointCap - rosterData.pointCount;
        rosterData.swcDiff = rosterData.swcCap - rosterData.swcCount;
        if (rosterData.pointDiff < 0) {
            rosterData.warningMessages.push("Too many points spent (" + rosterData.pointCount + "/" + rosterData.pointCap + ")");
            rosterData.pointWarning = true;
        }
        if (rosterData.swcDiff < 0) {
            rosterData.warningMessages.push("Too many swc spent (" + rosterData.swcCount + "/" + rosterData.swcCap + ")");
            rosterData.swcWarning = true;
        }
        if (needHacker && !hasHacker) {
            rosterData.warningMessages.push("Need an hacker for deploying REMs");
        }
        if (ltCount !== 1) {
            rosterData.warningMessages.push("Must have exactly one Lieutenant");
        }
        $.each(rosterData.trooperCountByCode, function (code, count) {
            var trooper = data.findTrooperByCode(code);
            if (trooper.hasLimitedAva && count > trooper.ava) {
                rosterData.warningMessages.push("Can have at most " + trooper.ava + " " + trooper.name);
            }
        });
    }

    validateRoster();

//    roster.addTrooperAndUpdateView = function (trooper) {
//        roster.addTrooper(trooper);
//    };

    var rosterTemplate = Handlebars.compile($('#ia-rosterTemplate').html());

    ui.armyRoster = {
        initArmyRoster: function () {
//            $('#ia-rosterWindow').dialog();
//            $('#ia-rosterWindow').draggable({
//                handle: '.ia-rosterHeader',
//                containment: 'window'
//            });
//                    .resizable();
        },
        updateArmyRoster: function () {
            $('#ia-rosterWrapper').html(rosterTemplate({
                messages: {
                    swc: "swc",
                    troopers: "troopers",
                    orders: "orders",
                    points: "points",
                    windowTitle: "roster"
                },
                roster: roster.getRosterData()
            }));
            var rosterContainer = $('#ia-rosterWrapper .ia-rosterContainer');
            rosterContainer.find('.ia-rosterDownButton').on('click', function () {
                $('.ia-rosterDownButton', rosterContainer).hide();
                $('.ia-rosterUpButton', rosterContainer).show();
                $('.ia-rosterBody', rosterContainer).show('fast');
                return false;
            });
            rosterContainer.find('.ia-rosterUpButton').on('click', function () {
                $('.ia-rosterUpButton', rosterContainer).hide();
                $('.ia-rosterDownButton', rosterContainer).show();
                $('.ia-rosterBody', rosterContainer).hide('fast');
                return false;
            });
            rosterContainer.find('.ia-rosterTrooperEntry').on('click', function () {
                log('click!', this);
//                if ($(this).hasClass('ia-selected')) {
//                    roster.removeTrooperByIndex(Number($(this).data('ia-entryindex')));
//                } else {
                $(this).parent().find('.ia-selected').removeClass('ia-selected');
                $(this).addClass('ia-selected');
                rosterContainer.find('.ia-rosterEntryButtons').show('fast');
//                }
                return false;
            });
            rosterContainer.find('.ia-rosterEntryRemove').on('click', function () {
                roster.removeTrooperByIndex(Number(rosterContainer.find('.ia-rosterTrooperEntry.ia-selected').data('ia-entryindex')));
            });
            rosterContainer.find('.ia-rosterEntryDetail').on('click', function () {
                ui.trooperSelector.updateTrooperSelector(
                        Number(rosterContainer.find('.ia-rosterTrooperEntry.ia-selected').data('ia-troopercode')),
                        Number(rosterContainer.find('.ia-rosterTrooperEntry.ia-selected').data('ia-optioncode')));
            });
            rosterContainer.find('.ia-rosterPrintButton').on('click', function () {
                roster.printRoster();
            });
        }
    };

//    $('#ia-rosterContainerOnTopBar').draggable();


})();