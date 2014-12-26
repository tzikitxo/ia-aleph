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


    var weaponsDisplayTemplate = Handlebars.compile($('#ia-weaponsDisplayTemplate').html());

    var weaponLikeEquipsAndSkills = {
        'MediKit': 'MediKit',
        'Forward Observer': 'Forward Observer'
    };
    var discoverWeapon = 'Discover',
            bareHandsWeapon = 'Bare Hands',
            suppressionFireWeapon = 'Suppressive Fire Mode';
    ui.weaponsDisplay = {
        showWeaponsDisplayForTrooper: function (trooper) {
            var weapons = [];
            var allWeapons = [].concat(trooper.allWeapons);
            $.each([].concat(trooper.allSkills).concat(trooper.allEquipments), function (i, name) {
                if (weaponLikeEquipsAndSkills[name]) {
                    allWeapons.push(weaponLikeEquipsAndSkills[name]);
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
                if ($.inArray('CC', weapon.traits) !== -1) {
                    addBarehands = false;
                }
            });
            if (addBarehands) {
                weapons.push(data.findWeaponsByName(bareHandsWeapon)[0]);
            }
            $.each(weapons, function (i, weapon) {
                if (weapons.mode !== suppressionFireWeapon && $.inArray('Suppressive Fire', weapon.traits) !== -1) {
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
            var weapons2 = [];
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
            ranges.sort();
            $.each(weapons, function (i, weapon) {
                weapon = $.extend({
                    rangeMods:[]
                }, weapon);
                if (typeof weapon.damage === 'string' && weapon.damage.match(/WIP|PH/)) {
                    weapon.damage = eval(weapon.damage.replace(/WIP/, trooper.wip).replace(/PH/, trooper.ph));
                }
                var basicValue = ($.inArray('Technical Weapon', weapon.traits) !== -1 || weapon.name === discoverWeapon) ? trooper.wip : trooper.bs;
                var rangeIndex = 0;
                if (weapon.hasRange) {
                    $.each(weapon.ranges, function (i, range) {
                        for (; ranges[rangeIndex] <= range; rangeIndex++) {
                            weapon.rangeMods.push(weapon.mods[i] + basicValue);
                        }
                    });
                }
                for (; rangeIndex < ranges.length; rangeIndex++) {
                    weapon.rangeMods.push('');
                }
                weapons2.push(weapon);
            });
            $('#ia-weaponsDisplayContainer').html(weaponsDisplayTemplate({
                weapons: weapons2,
                ranges: ranges,
                rangeLength: ranges.length
            }));
        }
    }

})();
