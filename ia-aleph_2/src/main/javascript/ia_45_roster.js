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
        trooperCount: 0
    };

    roster.getRosterData = function () {
        return rosterData;
    }
    roster.addTrooper = function (trooper) {
        rosterData.troopers.push(trooper);
        roster.validate();
        ui.armyRoster.updateArmyRoster();
    };
    roster.removeTrooperByIndex = function (trooperIndex) {
        rosterData.troopers.splice(trooperIndex, 1);
        roster.validate();
        ui.armyRoster.updateArmyRoster();
    };
    roster.validate = function () {
        rosterData.pointCount = 0;
        rosterData.swcCount = 0;
        rosterData.trooperCount = 0;
        rosterData.warningMessages = [];
        $.each(rosterData.troopers, function (i, trooper) {
            rosterData.pointCount += Number(trooper.cost) || 0;
            rosterData.swcCount += Number(trooper.swc) || 0;
            rosterData.trooperCount++;
        });
        rosterData.pointDiff = rosterData.pointCap - rosterData.pointCount;
        rosterData.swcDiff = rosterData.swcCap - rosterData.swcCount;
        //TODO
    };
    roster.validate();

//    roster.addTrooperAndUpdateView = function (trooper) {
//        roster.addTrooper(trooper);
//    };

    var rosterTemplate = Handlebars.compile($('#ia-rosterTemplate').html());

    ui.armyRoster = {
        updateArmyRoster: function () {
            $('#ia-rosterContainerOnTopBar').html(rosterTemplate({
                messages: {
                    swc: "swc",
                    troopers: "troopers",
                    points: "points"
                },
                roster: roster.getRosterData()
            })).find('.ia-rosterTrooperEntry').on('click', function () {
                roster.removeTrooperByIndex(Number($(this).data('ia-entryindex')));
            });
        }
    };


})();