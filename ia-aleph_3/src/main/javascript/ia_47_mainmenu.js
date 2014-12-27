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

    var mainMenuTemplate = Handlebars.compile($('#ia-mainMenuTemplate').html());

    ui.mainMenu = {
        showMainMenu: function () {
            $('#ia-mainMenuContainer').remove();
            var mainMenu = $(mainMenuTemplate({
                factions: data.getFactions()
            })).appendTo('body');
            mainMenu.dialog({
                modal: true,
                width: 450,
                height: 250
            });
            $('#ia-mainMenuContainer .ia-mainMenuFactionButton').on('click', function () {
                var factionCode = Number($(this).data('ia-factioncode'));
                data.loadTroopersByFaction(factionCode);
                roster.updateRosterData({
                    factionCode: factionCode,
                    troopers: []
                });
                ui.main.updateMainScreen();
                mainMenu.dialog('close');
            });
        }
    };


})();