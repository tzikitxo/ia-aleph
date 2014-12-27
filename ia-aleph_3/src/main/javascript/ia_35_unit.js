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


    var unitSelectorTemplate = Handlebars.compile($('#ia-unitSelectorTemplate').html());

    ui.unitSelector = {
        updateUnitSelector: function () {
            $('#ia-unitSelectorContainer').replaceWith(unitSelectorTemplate({}));
//            factionCode = factionCode || 1;
//            var faction = data.findFactionByCode(factionCode);
            var troopers = $.grep(data.getTroopers(), function (trooper) {
                return !trooper.isAlternateProfile;
            });
            var unitSelectorScroller = $('#ia-unitSelectorScroller');
            unitSelectorScroller.find('.ia-unitSelector').remove();
            $.each([].concat(troopers).reverse(), function (i, trooper) {
                var unitSelector = $('<img class="ia-unitSelector" />')
                        .attr('src', 'img/troop/' + trooper.logo + '_logo.png')
                        .attr('title', trooper.isc)
                        .prependTo(unitSelectorScroller).on('click', function () {
                    ui.trooperSelector.updateTrooperSelector(trooper.code);
                });
            });
//                unitSelectorScroller.draggable({cursor: "move",axis: "x", containment: [ x1, y1, x2, y2 ]});
//                unitSelectorScroller.draggable({cursor: "move", axis: "x"});
            $('#ia-unitSelectorScrollButtonLeft').on('click', function () {
                $('#ia-unitSelectorScrollerContainer').scrollLeft($('#ia-unitSelectorScrollerContainer').scrollLeft() - 50);
            });
            $('#ia-unitSelectorScrollButtonRight').on('click', function () {
                $('#ia-unitSelectorScrollerContainer').scrollLeft($('#ia-unitSelectorScrollerContainer').scrollLeft() + 50);
            });
            $('#ia-unitSelectorContainer').on('mousewheel', function (event) {
                $('#ia-unitSelectorScrollerContainer').scrollLeft($('#ia-unitSelectorScrollerContainer').scrollLeft() + (event.deltaY < 0 ? +1 : -1) * 50);
            });
//            $('#ia-unitSelectorScrollerContainer').jScrollPane();
        }
    };


})();