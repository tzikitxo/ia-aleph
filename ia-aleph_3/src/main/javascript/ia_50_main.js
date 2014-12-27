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

    var mainScreenTemplate = Handlebars.compile($('#ia-mainScreenTemplate').html());



    $('#ia-mainContainer').html(mainScreenTemplate({
        messages: {
            mainMenu: 'Main Menu',
            weaponsButtonTitle: 'Weapons'
        }
    }));
    $('#ia-mainMenuButton').on('click', function () {
        ui.mainMenu.showMainMenu();
    });

    data.loadTroopersByFaction(1);

    ui.main = {
        updateMainScreen: function () {
            ui.unitSelector.showUnitSelector();
            ui.trooperSelector.showTrooperSelector();
            ui.armyRoster.updateArmyRoster();
            ui.weaponsDisplay.initializeWeaponsDisplay();
        }
    };
    
    ui.main.updateMainScreen();



    $('#ia-loadingContainer').hide();
    $('#ia-mainContainer').show();

})();