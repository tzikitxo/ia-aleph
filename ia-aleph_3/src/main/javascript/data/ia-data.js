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

    var ia = window.ia = window.ia || {};
    var data = ia.data = {};

    data.factions = anyplacetools.importFile('data/factions.yml');

    data.troopers = anyplacetools.importFile('data/troopers.yml');
    
    data.weapons = anyplacetools.importFile('data/weapons.yml');
    
    data.references = anyplacetools.importFile('data/references.yml');
    
    data.hacking = anyplacetools.importFile('data/hacking.yml');

})();