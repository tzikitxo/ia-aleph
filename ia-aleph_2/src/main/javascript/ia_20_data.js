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

var data = ia.data;

(function () {

    var troopersByCode = {};
    $.each(data.troopers, function (i, trooper) {
        troopersByCode[trooper.code] = trooper;
        trooper.options = $.map(trooper.options, function (option) {
            option = $.extend({
                bsw: [],
                ccw: [],
                swc: '',
                cost: '',
                skills: [],
                equipments: []
            }, option);
            option.allBsw = [].concat(trooper.bsw).concat(option.bsw);
            option.allCcw = [].concat(trooper.ccw).concat(option.ccw);
            option.allSkills = [].concat(trooper.skills).concat(option.skills);
            option.allEquipments = [].concat(trooper.equipments).concat(option.equipments);
            //TODO sort by range
            return option;
//            option.skillsAndEquipments = [].concat(option.skills || []).concat(option.equipments || []);
        });
    });

    data.findTrooperByCode = function (code) {
        return troopersByCode[code];
    }

})();
