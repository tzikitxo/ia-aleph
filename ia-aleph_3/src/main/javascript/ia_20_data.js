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
        faction.sectorials = [];
    });

    var sectorialsByCode = {};
    $.each(data.sectorials, function (i, sectorial) {
        factionsByCode[sectorial.faction].sectorials.push(sectorial);
        sectorialsByCode[sectorial.code] = sectorial;
    });

    data.findFactionOrSectorialByCode = function (code) {
        return factionsByCode[code] || sectorialsByCode[code];
    };

    var actualFactions = $.grep(data.factions, function (faction) {
        return !faction.isPseudofaction;
    });
    data.getFactions = function () {
        return actualFactions;
    };



    var troopersByCode = {};
    var troopers = [];
    function loadTroopers(troopersToLoad, factionOrSectorial) {
        troopersByCode = {};
        troopers = [];
        $.each(troopersToLoad, function (i, trooper) {
            troopersByCode[trooper.code] = trooper = $.extend({
                profileorder: 10,
                troopercode: trooper.code,
                bsw: [],
                ccw: [],
                skills: [],
                equipments: [],
                options: [],
                otherprofiles: [],
                name: '',
                isc: '',
                isRegular: !trooper.irregular,
                isIrregular: trooper.irregular,
                isImpetuous: trooper.impetuosity === 'I',
                isFrenzy: trooper.impetuosity === 'F',
                isExtremelyImpetuous: trooper.impetuosity === 'E',
                hasCube: trooper.backup === 'C' || trooper.backup === 'C2',
                hasCube2: trooper.backup === 'C2',
                hasLimitedAva: typeof trooper.ava === 'number',
                hasSkillOrEquipment: function (name) {
                    if ($.inArray(name, this.skills) !== -1) {
                        return true;
                    } else if ($.inArray(name, this.equipments) !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }, trooper);
            troopers.push(trooper);
        });
        function processCompositeTrooper(trooper, parent) {
            if (trooper.compositetroop) {
                trooper.compositetroop = $.map(trooper.compositetroop, function (item) {
                    if (typeof item === 'number') {
                        item = {code: item};
                    }
                    item.max = item.max || 1;
                    item.min = item.min || 1;
                    return item;
                });
                trooper.isHeadOfCompositeUnit = trooper.isPartOfCompositeUnit = true;
                trooper.getCompositeSwc = function () {
                    var swc = 0, me = this;
                    $.each(trooper.compositetroop, function (i, compositeoption) {
                        swc += Number(compositeoption.code === me.troopercode ? me.swc : troopersByCode[compositeoption.code].options[0].swc) || 0;
                    });
                    return swc;
                };
                trooper.getCompositeCost = function () {
                    var cost = 0, me = this;
                    $.each(trooper.compositetroop, function (i, compositeoption) {
                        cost += Number(compositeoption.code === me.troopercode ? me.cost : troopersByCode[compositeoption.code].options[0].cost) || 0;
                    });
                    return cost;
                };
//                var compositeCost = 0, compositeSwc = 0;
                $.each(trooper.compositetroop, function (i, compositeoption) {
                    compositeoption.troop = troopersByCode[compositeoption.code];
                    if (compositeoption.troop !== (parent || trooper)) {
                        compositeoption.troop.isPartOfCompositeUnit = true;
                        compositeoption.troop.compositeUnitHeadTrooperCode = (parent || trooper).code;
//                        compositeoption.troop.compositeUnitHeadOptionCode = parent ? trooper.code : null;
                        if ($.inArray(compositeoption.code, (parent || trooper).otherprofiles) === -1) {
                            (parent || trooper).otherprofiles.push(compositeoption.code);
                        }
                    }
//                    var option = compositeoption.troop.options[0];
//                    compositeCost += Number(option.cost) || 0;
//                    compositeSwc += Number(option.swc) || 0;
                });
//                trooper.compositeCost = compositeCost;
//                trooper.compositeSwc = compositeSwc;
            }
        }
        $.each(troopers, function (i, trooper) {
            processCompositeTrooper(trooper);
            $.each(trooper.options, function (i, option) {
                processCompositeTrooper(option, trooper);
            });
            if (trooper.otherprofiles) {
                $.each(trooper.otherprofiles, function (i, altp) {
                    troopersByCode[altp].isAlternateProfile = true;
                });
            }
        });
        $.each(troopers, function (i, trooper) {
            trooper.longisc = trooper.longisc || trooper.isc.toUpperCase();
            trooper.isHackable = (trooper.type === 'REM' || trooper.type === 'TAG' || trooper.type === 'HI') && !trooper.hasSkillOrEquipment('Not Hackable');
            trooper.hasStr = (trooper.hasStr !== undefined) ? trooper.hasStr : (trooper.type === 'REM' || trooper.type === 'TAG');
            trooper.getFaction = function () {
                return factionsByCode[this.faction];
            };
            trooper.isSlaveOption = function () {
                return (this.isPartOfCompositeUnit && !this.isHeadOfCompositeUnit) || (this.isAlternateProfile);
            };
            var trooperOptionsByCode = {};
            var optionsToLoad = $.grep(trooper.options, function (option) {
                if (option.onlyIn) {
                    return factionOrSectorial.code === option.onlyIn;
                } else if (option.notIn) {
                    return factionOrSectorial.code !== option.notIn;
                } else {
                    return true;
                }
            });
            trooper.options = $.map(optionsToLoad, function (option) {
                option = $.extend({
                    optioncode: option.code
                }, trooper, {
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
//                option.isHackable = option.isHackable || option.hasSkillOrEquipment('Hacker');
                if (typeof option.swc === 'number' && option.swc < 0) {
                    option.positiveSwc = true;
                    option.swcStr = '+' + (-option.swc);
                } else {
                    option.swcStr = option.swc;
                }
                trooperOptionsByCode[option.code] = option;
                return option;
            });
            trooper.hasOptions = trooper.options.length > 0;
            trooper.findTrooperOptionByCode = function (optionCode) {
                return trooperOptionsByCode[optionCode];
            };
        });

//        $.each(troopers, function (i, trooper) {
//            if (trooper.otherprofiles) {
//                $.each(trooper.otherprofiles, function (i, altp) {
//                    troopersByCode[altp].isAlternateProfile = true;
//                });
//            }
//        });
//        $.each(altps, function (altp) {
//            troopersByCode[altp].isAlternateProfile = true;
//        });
    }
//    var troopersByFaction = {};


    data.findTrooperByCode = function (code) {
        return troopersByCode[code];
    };


    var troopersDataByCode = {};
    $.each(data.troopers, function (i, trooper) {
        troopersDataByCode[trooper.code] = trooper;
    });
    data.loadTroopersByFaction = function (factionCode) {
        var troopersToLoad = [];

        var sectorial = sectorialsByCode[factionCode], faction = factionsByCode[factionCode];
        var loadedTroopers = {};
        function loadTrooper(trooperCode, trooperSpecs) {
            var trooperData = troopersDataByCode[trooperCode];
            loadedTroopers[trooperCode] = true;
            trooperData = $.extend(true, {}, trooperData);
            trooperData.ava = trooperSpecs.ava;
            if (trooperSpecs.link) {
                (trooperData.skills = trooperData.skills || []).push("Fireteam");
            }
            troopersToLoad.push(trooperData);
            $.each(trooperData.otherprofiles || [], function (i, otherProfile) {
                loadTrooper(otherProfile, trooperSpecs);
            });
            $.each([trooperData].concat(trooperData.options || []), function (i, data) {
                $.each(data.compositetroop || [], function (i, otherTrooper) {
                    var code = otherTrooper.code || otherTrooper;
                    if (!loadedTroopers[code]) {
                        loadTrooper(code, trooperSpecs);
                    }
                });
            });
        }
        if (sectorial) {
            $.each(sectorial.troopers, function (i, sectorialTrooper) {
                loadTrooper(sectorialTrooper.code, sectorialTrooper);
            });
        } else {
            $.each(data.troopers, function (i, trooperData) {
                if (trooperData.faction === factionCode) {
                    troopersToLoad.push($.extend(true, {}, trooperData));
                }
            });
            $.each(faction.troopers || [], function (i, factionTrooper) {
                loadTrooper(factionTrooper.code, factionTrooper);
            });
        }

        loadTroopers(troopersToLoad, sectorial || factionsByCode[factionCode]);
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
        $.each(weapon.names || [weapon.name], function (i, weaponName) {
            if (weaponsByName[weaponName]) {
                weaponsByName[weaponName].push(weapon);
            } else {
                weaponsByName[weaponName] = [weapon];
            }
        });
        return weapon;
    });
    data.findWeaponsByName = function (name) {
        if (!weaponsByName[name] && name.match(/ *\([0-9]+\) */)) {
            var weaponName = name.replace(/ *\([0-9]+\) */, ''), weaponCount = Number(name.replace(/.*\(([0-9]+)\).*/, '$1'));
            var weapon = weaponsByName[weaponName];
            if (weapon) {
                weapon = $.map(weapon, function (weapon) {
                    weapon = $.extend({}, weapon);
                    weapon.burst += 1;
                    weapon.name = weaponName + ' (' + weaponCount + ')';
                    delete weapon.code;
                    return weapon;
                });
                weaponsByName[name] = weaponsByName[weapon[0].name] = weapon;
            }
        }
        return weaponsByName[name];
    };

    data.getReferenceTableData = function (name) {
        return data.references[name];
    };

    var hackingDevicesByName = {}, hackingProgramsByCode = {};
    $.each(data.hacking.hackingPrograms, function (i, hackingProgram) {
        hackingProgramsByCode[hackingProgram.code] = hackingProgram;
    });

    $.each(data.hacking.hackingDevices, function (i, hackingDevice) {
        hackingDevicesByName[hackingDevice.name] = $.extend({}, hackingDevice, {
            getPrograms: function () {
                return $.map(this.programs, function (code) {
                    return  hackingProgramsByCode[code];
                });
            }
        });
    });

    data.getHackingDeviceByName = function (name) {
        return hackingDevicesByName[name];
    };

})();
