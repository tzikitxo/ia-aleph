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

    roster.updateRosterData = function (config) {
        $.extend(rosterData, config);
        roster.validate();
    };
//    roster.clearRosterTroopers = function () {
//        rosterData.troopers = [];
//        roster.validate();
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
        rosterData.troopers.push($.extend({
            rosterentrycode: getNextRosterEntryCode()
        }, trooper));
        roster.validate();
        ui.armyRoster.updateArmyRoster();
    };
    roster.removeTrooperByIndex = function (trooperIndex) {
        rosterData.troopers.splice(trooperIndex, 1);
        roster.validate();
        ui.armyRoster.updateArmyRoster();
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
        data.loadTroopersByFaction(factionCode);
        roster.updateRosterData({
            pointCap: pcap,
            swcCap: swcap,
            factionCode: factionCode
        });
        $.each(str.replace(/^.*?T/, '').split('T'), function (i, tr) {
            var troopcode = Number(str.split(/O/)[0]), optioncode = Number(str.split(/O/)[1]);
            var trooper = data.findTrooperByCode(troopcode).findTrooperOptionByCode(optioncode);
            roster.addTrooper(trooper);
        });
    };
    roster.validate = function () {
        rosterData.pointCount = 0;
        rosterData.swcCount = 0;
        rosterData.trooperCount = 0;
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
    };
    roster.validate();

//    roster.addTrooperAndUpdateView = function (trooper) {
//        roster.addTrooper(trooper);
//    };

    var rosterTemplate = Handlebars.compile($('#ia-rosterTemplate').html());

    ui.armyRoster = {
        updateArmyRoster: function () {
            var rosterContainer = $('#ia-rosterContainerOnTopBar').html(rosterTemplate({
                messages: {
                    swc: "swc",
                    troopers: "troopers",
                    points: "points"
                },
                roster: roster.getRosterData()
            }));
            rosterContainer.find('.ia-rosterDownButton').on('click', function () {
                $('.ia-rosterDownButton', rosterContainer).hide();
                $('.ia-rosterBody', rosterContainer).show('fast');
                return false;
            });
            rosterContainer.find('.ia-rosterUpButton').on('click', function () {
                $('.ia-rosterBody', rosterContainer).hide('fast', function () {
                    $('.ia-rosterDownButton', rosterContainer).show();
                });
                return false;
            });
            rosterContainer.find('.ia-rosterTrooperEntry').on('click', function () {
                if ($(this).hasClass('ia-selected')) {
                    roster.removeTrooperByIndex(Number($(this).data('ia-entryindex')));
                } else {
                    $(this).parent().find('.ia-selected').removeClass('ia-selected');
                    $(this).addClass('ia-selected');
                }
                return false;
            });
        }
    };


})();