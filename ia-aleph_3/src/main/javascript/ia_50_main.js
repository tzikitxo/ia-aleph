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
            weaponsButtonTitle: 'Weapons',
            hackingButtonTitle: 'Hacking Programs'
        }
    }));
    $('#ia-mainMenuButton').on('click', function () {
        ui.mainMenu.showMainMenu();
    });

    function loadDefaultRoster() {
        data.loadTroopersByFaction(1);
        roster.updateRosterData({
            factionCode: 1,
            troopers: []
        });
    }

    try {
        var lastSavedRoster = storage.getLastSavedRoster();
        if (window.location.search && window.location.search.match(/roster=.+/)) {
            roster.loadRosterData(window.location.search.replace(/.*roster=([a-zA-Z0-9]+).*/, '$1'), true);
            if (window.history && window.history.pushState) {
                window.history.pushState(null, "", window.location.href.replace(/[?].*/, ''));
            }
        } else if (lastSavedRoster) {
            roster.loadRosterData(lastSavedRoster);
        } else {
            loadDefaultRoster();
        }
    } catch (e) {
        log('error loading roster')
        log(e);
        loadDefaultRoster();
    }

    ui.main = {
        updateMainStuffForFaction: function (faction) {
            $('#ia-favicon').attr('href', 'img/army/' + faction.logo + '_logo.png');
            $('#ia-mainMenuButton').attr('src', 'img/army/' + faction.logo + '_logo.png');
        },
        updateMainScreen: function () {
            ui.main.updateMainStuffForFaction(data.findFactionOrSectorialByCode(roster.getRosterData().factionCode));
            ui.unitSelector.updateUnitSelector();
            ui.trooperSelector.updateTrooperSelector();
            ui.armyRoster.updateArmyRoster();
            ui.weaponsDisplay.initializeWeaponsDisplay();
        }
    };

    ui.armyRoster.initArmyRoster();
    ui.main.updateMainScreen();



    $('#ia-loadingContainer').hide();
    $('#ia-mainContainer').show();

})();