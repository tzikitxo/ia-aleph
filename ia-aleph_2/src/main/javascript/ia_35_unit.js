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

    ui.unitSelector = {
        showUnitSelector: function (factionCode) {
            factionCode = factionCode || 1;
            var faction = data.findFactionByCode(factionCode);
            var troopers = data.findTroopersByFaction(factionCode);
            var unitSelectorContainer = $('#ia-unitSelectorContainer').empty();
            $.each(troopers, function (i, trooper) {
                var unitSelector = $('<img class="ia-unitSelector" />')
                        .attr('src', 'img/troop/' + trooper.logo + '_logo.png')
                        .attr('title', trooper.isc)
                        .appendTo(unitSelectorContainer).on('click', function () {
                    ui.trooperSelector.showTrooperSelector(trooper.code);
                });
            });
        }
    };


})();