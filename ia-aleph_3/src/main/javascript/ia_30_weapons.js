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

    ui.weaponsDisplay = {
        showWeaponsDisplayForTrooper: function (trooper) {
            var weapons = [];
            $.each(trooper.allWeapons, function (i, weaponName) {
                var weaponsByName = data.findWeaponsByName(weaponName);
                if (weaponsByName) {
                    weapons = weapons.concat(weaponsByName);
                } else {
                    log('WARNING: weapons not found for name = ', weaponName);
                }
            });
            $('#ia-weaponsDisplayContainer').html(weaponsDisplayTemplate({
                weapons: weapons
            }));
        }
    }

})();
