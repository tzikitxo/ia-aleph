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
    var unitSelectorSearchTemplate = Handlebars.compile($('#ia-unitSelectorSearchTemplate').html());

    ui.unitSelector = {
        updateUnitSelector: function (config) {
            config = config || {};
//            factionCode = factionCode || 1;
//            var faction = data.findFactionByCode(factionCode);
            var troopers = $.grep(data.getTroopers(), function (trooper) {
                return !trooper.isAlternateProfile;
            });
//            var unitSelectorScroller = $('#ia-unitSelectorScroller');
//            unitSelectorScroller.find('.ia-unitSelector').remove();
            var filterFunction = function () {
                return true;
            };
            if (config.filterByUnitType) {
                filterFunction = function (trooper) {
                    return trooper.type === config.filterByUnitType;
                };
                $('#ia-unitSelectorSearchButton').text(config.filterByUnitType).css({'background-position': '5px 0'});
            } else if (config.filterBySearch) {
                filterFunction = function (trooper) {
                    return trooper.isc.toLowerCase().match(config.filterBySearch);
                };
                $('#ia-unitSelectorSearchButton').text(config.filterBySearch).css({'background-position': '5px 0'});
            }
            var unitsForButtons = $.map($.grep([].concat(troopers), filterFunction), function (trooper) {
                return {
                    logo: trooper.logo,
                    title: trooper.isc,
//                    name: trooper.isc.replace(/ .*/,''),
                    name: trooper.name.toLowerCase(),
                    otherclass: trooper.isSlaveOption() ? 'ia-unitSelector-slaveOption' : '',
                    troopercode: trooper.code
                };
//                var unitSelector = $('<img class="ia-unitSelector" />')
//                        .attr('src', 'img/troop/' + trooper.logo + '_logo_small.png')
//                        .attr('title', trooper.isc)
//                        .prependTo(unitSelectorScroller).on('click', function () {
//                    ui.trooperSelector.updateTrooperSelector(trooper.code);
//                });
//                if (trooper.isSlaveOption()) {
//                    unitSelector.addClass('ia-unitSelector-slaveOption');
//                }
            });
            $('#ia-unitSelectorContainer').replaceWith(unitSelectorTemplate({
                units: unitsForButtons
            }));
            $('#ia-unitSelectorContainer .ia-unitSelector').on('click', function () {
                ui.trooperSelector.updateTrooperSelector(Number($(this).data('ia-troopercode')));
            });

//                unitSelectorScroller.draggable({cursor: "move",axis: "x", containment: [ x1, y1, x2, y2 ]});
//                unitSelectorScroller.draggable({cursor: "move", axis: "x"});
            var scrollAmount = 150;
            $('#ia-unitSelectorScrollButtonLeft').on('click', function () {
                $('#ia-unitSelectorScrollerContainer').scrollLeft($('#ia-unitSelectorScrollerContainer').scrollLeft() - scrollAmount);
            });
            $('#ia-unitSelectorScrollButtonRight').on('click', function () {
                $('#ia-unitSelectorScrollerContainer').scrollLeft($('#ia-unitSelectorScrollerContainer').scrollLeft() + scrollAmount);
            });
            $('#ia-unitSelectorScrollerContainer').on('mousewheel', function (event) {
                $('#ia-unitSelectorScrollerContainer').scrollLeft($('#ia-unitSelectorScrollerContainer').scrollLeft() + (event.deltaY < 0 ? +1 : -1) * 50);
                return false;
            });

            $('#ia-unitSelectorSearchButton').on('click', function () {
                if (!$('#ia-untiSelectorSearchOptions').is(':visible')) {
                    $('#ia-untiSelectorSearchOptions').html(unitSelectorSearchTemplate({
                        unitTypes: ['LI', 'MI', 'HI', 'WB', 'SK', 'REM', 'TAG', 'ALL'],
                        messages: {
                            unitTypes: 'Unit Type: ',
                            search: 'Search: '
                        }
                    }));
                    $('#ia-untiSelectorSearchOptions .ia-unitSelectorSearchUnitTypeButton').on('click', function () {
                        var unitType = $(this).data('ia-unittype');
                        ui.unitSelector.updateUnitSelector({
                            filterByUnitType: unitType === "ALL" ? null : unitType
                        });
//                        $('#ia-untiSelectorSearchOptions').slideUp('fast');
                    });
                    $('#ia-unitSelectorSearchField').on('change', function () {
                        var value = $(this).val();
                        ui.unitSelector.updateUnitSelector({
                            filterBySearch: value.toLowerCase()
                        });
                    });
                    $('#ia-unitSelectorSearchFieldClearButton').on('click', function () {
                        $('#ia-unitSelectorSearchField').val('');
                        ui.unitSelector.updateUnitSelector({
                            filterBySearch: null
                        });
                    });
                    $('#ia-untiSelectorSearchOptions').slideDown('fast');
                } else {
                    $('#ia-untiSelectorSearchOptions').slideUp('fast');
                }
            });
//            $('#ia-unitSelectorScrollerContainer').jScrollPane();
        }
    };


})();