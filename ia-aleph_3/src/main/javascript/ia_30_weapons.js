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

    var weapons = ia.weapons = ia.weapons || {};

    var discoverWeapon = 'Discover',
            bareHandsWeapon = 'Bare Hands',
            suppressionFireWeapon = 'Suppressive Fire Mode',
            suppressiveFireTrait = 'Suppressive Fire',
            technicalWeaponTrait = 'Technical Weapon',
            trowingWeaponTrait = 'Throwing Weapon',
            deactivatorWeapon = 'Deactivator',
            ccTrait = 'CC';

    var weaponsDisplayTemplate = Handlebars.compile($('#ia-weaponsDisplayTemplate').html());

    function getColorByRange(range) {
        var
                p = (range / 20),
                g = p >= 0.5 ? (200) : (p * 0.8 * 2 * 255),
                r = p > 0.5 ? ((1 - p) * 0.9 * 2 * 255) : 250,
                b = 0;
        return 'rgb('
                + (Math.round(r) % 256) + ','
                + (Math.round(g) % 256) + ','
                + (Math.round(b) % 256) + ')';
    }
    Handlebars.registerHelper("weaponColorByRange", function (context) {
        if (typeof context === 'number' && context > 0) {
            return getColorByRange(context);
        } else {
            return 'black';
        }
    });
    Handlebars.registerHelper("weaponColorByMod", function (context) {
        if (typeof context === 'number') {
            return getColorByRange(context + 12);
        } else {
            return 'black';
        }
    });

    function getWeaponsForTrooper(trooper) {
        var weapons = [];
        var allWeapons = [].concat(trooper.allWeapons);
        $.each([].concat(trooper.allSkills).concat(trooper.allEquipments), function (i, name) {
            if (weaponLikeEquipsAndSkills[name]) {
                allWeapons.push.apply(allWeapons, weaponLikeEquipsAndSkills[name]);
            }
        });
        allWeapons.push(discoverWeapon);
        var addBarehands = true;
        $.each(allWeapons, function (i, weaponName) {
            if (weaponName.match(/\+/)) {
                allWeapons.push.apply(allWeapons, weaponName.split(/ *\+ */));
            }
        });
        $.each(allWeapons, function (i, weaponName) {
            var weaponsByName = data.findWeaponsByName(weaponName);
            if (weaponsByName) {
                weapons = weapons.concat(weaponsByName);
            } else {
                log('WARNING: weapons not found for name = ', weaponName);
            }
        });
        var addBarehands = true;
        $.each(weapons, function (i, weapon) {
            if (weapon.hasTrait(ccTrait)) {
                addBarehands = false;
            }
        });
        if (addBarehands) {
            weapons.push(data.findWeaponsByName(bareHandsWeapon)[0]);
        }
        $.each(weapons, function (i, weapon) {
            if (weapons.mode !== suppressionFireWeapon && weapon.hasTrait(suppressiveFireTrait)) {
                var supFire = data.findWeaponsByName(suppressionFireWeapon)[0];
                supFire = $.extend({}, supFire, {
                    damage: weapon.damage,
                    ammunitions: weapon.ammunitions,
                    traits: weapon.traits,
                    name: weapon.name,
                    mode: supFire.name
                });
                weapons.push(supFire);
            }
        });
        if (trooper.hasSkillOrEquipment('X Visor')) {
            weapons = $.map(weapons, function (weapon) {
                if (weapon.hasRange) {
                    return $.extend({}, weapon, {
                        mods: $.map(weapon.mods, function (mod) {
                            if (mod === -3) {
                                return 0;
                            } else if (mod === -6) {
                                return -3;
                            } else {
                                return mod;
                            }
                        }),
                        mode: (weapon.mode ? (weapon.mode + ' ') : '') + '(X Visor)',
                        code: -weapon.code
                    });
                } else {
                    return weapon;
                }
            });
        }
        return weapons;
    }

    function prepareWeaponsForDisplay(weapons, trooper) {
        var rangesSet = {}, ranges = [];
        $.each(weapons, function (i, weapon) {
            if (weapon.hasRange) {
                $.each(weapon.ranges, function (i, range) {
                    if (!rangesSet[range]) {
                        rangesSet[range] = true;
                        ranges.push(range);
                    }
                });
            }
        });
        ranges.sort(function (a, b) {
            return a - b;
        });
        var weapons2 = [];
        $.each(weapons, function (i, weapon) {
            weapon = $.extend({
                rangeMods: [],
                rangeSum: 0
            }, weapon);
            var basicValue = null;
            if (trooper) {
                if (typeof weapon.damage === 'string' && weapon.damage.match(/WIP|PH/)) {
                    weapon.damage = '<i>' + eval(weapon.damage.replace(/WIP/, trooper.wip).replace(/PH/, trooper.ph)) + '</i>';
                }
                var basicValue = trooper.bs;
                if (weapon.hasTrait(technicalWeaponTrait) || weapon.name === discoverWeapon || weapon.name === deactivatorWeapon) {
                    basicValue = trooper.wip;
                } else if (weapon.hasTrait(trowingWeaponTrait)) {
                    basicValue = trooper.ph;
                }
            }
            var rangeIndex = 0;
            if (weapon.hasRange) {
                $.each(weapon.ranges, function (i, range) {
                    for (; ranges[rangeIndex] <= range; rangeIndex++) {
                        var value = weapon.mods[i];
                        if (trooper) {
                            value += basicValue;
                        }
                        weapon.rangeMods.push(value);
                        weapon.rangeSum += value;
                    }
                });
            } else {
                weapon.rangeLength = ranges.length;
            }
            for (; rangeIndex < ranges.length; rangeIndex++) {
                weapon.rangeMods.push('-');
            }
            if (!weapon.hasTrait(ccTrait)) {
                weapon.rangeSum += 0.5;
            }
            if (typeof weapon.damage === 'number') {
                weapon.rangeSum += weapon.damage / 100;
            }
            weapons2.push(weapon);
        });
        weapons2.sort(function (a, b) {
            return b.rangeSum - a.rangeSum;
        });
        weapons2.weaponRanges = ranges;
        return weapons2;
    }
    var weaponLikeEquipsAndSkills = {
        'MediKit': ['MediKit'],
        'Engineer': [deactivatorWeapon],
        'Forward Observer': ['Forward Observer', 'Flash Pulse']
    };
    var lastTrooper = null;

    weapons.getDisplayWeaponsForTroopers = function (troopers) {
        var allWeapons = [], allWeaponsByCode = {};
        $.each(troopers, function (i, trooper) {
            var weapons = getWeaponsForTrooper(trooper);
            $.each(weapons, function (i, weapon) {
                if (!allWeaponsByCode[weapon.code]) {
                    allWeapons.push(weapon);
                    allWeaponsByCode[weapon.code] = true;
                }
            });
        });
        //TODO
    };

    ui.weaponsDisplay = {
        initializeWeaponsDisplay: function () {
            $('#ia-weaponsDisplayButton').on('click', function () {
                $('#ia-weaponsDisplayContainer').show('fast');
                ui.trooperSelector.enableTrooperSelectorLogoSelector();
            });
        },
        updateWeaponsDisplayForTrooper: function (trooper) {
            if ($('#ia-weaponsDisplayContainer').is(':visible')) {
                ui.trooperSelector.enableTrooperSelectorLogoSelector();
            }
            lastTrooper = trooper = trooper || lastTrooper;

            var weapons = getWeaponsForTrooper(trooper);

            var trooperProfileForWeapons = ui.trooperSelector.getSelectedTrooperLogo() || trooper;
            var weapons2 = prepareWeaponsForDisplay(weapons, trooperProfileForWeapons);

            $('#ia-weaponsDisplayContainer').html(weaponsDisplayTemplate({
                weapons: weapons2,
                ranges: weapons2.weaponRanges,
                messages: {
                    name: "Name",
                    range: "Range",
                    damage: "Damage",
                    burst: "B",
                    ammunitions: "Ammunition",
                    traits: "Traits",
                    rangeSpec: "(up to)"
                }
            }));
            $('#ia-weaponsDisplayContainer .ia-infoDownButton').on('click', function () {
                $('#ia-weaponsDisplayContainer').hide('fast');
                ui.trooperSelector.disableTrooperSelectorLogoSelector();
            });
        }
    }

})();
