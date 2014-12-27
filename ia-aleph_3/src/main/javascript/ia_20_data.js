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

var data = ia.data;

(function () {

    var factionsByCode = {};
    $.each(data.factions, function (i, faction) {
        factionsByCode[faction.code] = faction;
    });

    data.findFactionByCode = function (code) {
        return factionsByCode[code];
    };

    var troopersByCode = {};
    var troopers = [];
    function loadTroopers(troopersToLoad) {
        troopersByCode = {};
        troopers = [];
        $.each(troopersToLoad, function (i, trooper) {
            troopersByCode[trooper.code] = trooper = $.extend({
                bsw: [],
                ccw: [],
                skills: [],
                equipments: [],
                isRegular: !trooper.irregular,
                isIrregular: trooper.irregular,
                isImpetuous: trooper.impetuosity === 'I',
                isFrenzy: trooper.impetuosity === 'F',
                isExtremelyImpetuous: trooper.impetuosity === 'E',
                hasCube: trooper.backup === 'C' || trooper.backup === '2',
                hasCube2: trooper.backup === '2'
            }, trooper);
            troopers.push(trooper);
            trooper.longisc = trooper.longisc || trooper.isc.toUpperCase();
            trooper.isHackable = trooper.type === 'REM' || trooper.type === 'TAG' || trooper.type === 'HI';// TODO
            trooper.hasStr = trooper.hasStr || trooper.type === 'REM' || trooper.type === 'TAG';
            var trooperOptionsByCode = {};
            trooper.options = $.map(trooper.options, function (option) {
                option = $.extend({}, trooper, {
                    swc: '',
                    cost: '',
                    bsw: [],
                    ccw: [],
                    skills: [],
                    equipments: [],
                    hasSkillOrEquipment: function (name) {
                        if ($.inArray(name, this.allSkills) !== -1) {
                            return true;
                        } else if ($.inArray(name, this.allEquipments) !== -1) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }, option);
                //TODO sort by range
                option.allBsw = [].concat(trooper.bsw).concat(option.bsw);
                option.allCcw = [].concat(trooper.ccw).concat(option.ccw);
                option.allWeapons = [].concat(option.allBsw).concat(option.allCcw);
                option.allSkills = [].concat(trooper.skills).concat(option.skills);
                option.allEquipments = [].concat(trooper.equipments).concat(option.equipments);
                if (typeof option.swc === 'number' && option.swc < 0) {
                    option.positiveSwc = true;
                    option.swcStr = '+' + (-option.swc);
                } else {
                    option.swcStr = option.swc;
                }
                trooperOptionsByCode[option.code] = option;
                return option;
            });
            trooper.findTrooperOptionByCode = function (optionCode) {
                return trooperOptionsByCode[optionCode];
            };
        });
    }
//    var troopersByFaction = {};


    data.findTrooperByCode = function (code) {
        return troopersByCode[code];
    };

    data.loadTroopersByFaction = function (factionCode) {
        var troopersToLoad = [];
        $.each(data.troopers, function (i, trooper) {
            if (trooper.faction === factionCode) {
                troopersToLoad.push(trooper);
            }
        });
        loadTroopers(troopersToLoad);
    };
    data.getTroopers = function () {
        return troopers;
    };
//    data.findTroopersByFaction = function (factionCode) {
//        if (!troopersByFaction[factionCode]) {
//            troopersByFaction[factionCode] = [];
//            $.each(data.troopers, function (i, trooper) {
//                if (trooper.faction === factionCode) {
//                    troopersByFaction[factionCode].push(trooper);
//                }
//            });
//        }
//        return troopersByFaction[factionCode];
//    };

    var weaponsByName = {};
    data.weapons = $.map(data.weapons, function (weapon) {
        weapon = $.extend({
            damage: '-',
            traits: [],
            ammunitions: '-',
            hasTrait: function (trait) {
                return $.inArray(trait, this.traits) !== -1;
            }
        }, weapon);
        weapon.hasRange = weapon.ranges ? true : false;
        if (weaponsByName[weapon.name]) {
            weaponsByName[weapon.name].push(weapon);
        } else {
            weaponsByName[weapon.name] = [weapon];
        }
        return weapon;
    });
    data.findWeaponsByName = function (name) {
        return weaponsByName[name];
    };

})();
