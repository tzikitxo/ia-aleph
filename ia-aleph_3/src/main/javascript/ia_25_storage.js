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

var storage = ia.storage = {};

(function () {

    var currentConfig = {};
    var hasLocalStorage = window.localStorage ? true : false;
    storage.saveConfig = function (config) {
        $.extend(currentConfig, config);
        if (hasLocalStorage) {
            localStorage.setItem('ia3config',JSON.stringify(currentConfig));
        }
    };
    storage.getConfig = function () {
        return currentConfig;
    };

    var lastSavedRoster = null;
    storage.saveRoster = function (serializedRoster) {
        lastSavedRoster = serializedRoster;
        if (hasLocalStorage) {
            localStorage.setItem('ia3roster',lastSavedRoster);
        }
    };
    storage.getLastSavedRoster = function () {
        return lastSavedRoster;
    };

    if (hasLocalStorage) {
        try {
            currentConfig = JSON.parse(localStorage.getItem('ia3config')) || {};
        } catch (e) {
            log('error loading saved config', e);
        }
        try {
            lastSavedRoster = localStorage.getItem('ia3roster') || null;
        } catch (e) {
            log('error loading last saved roster', e);
        }
    }

})();
