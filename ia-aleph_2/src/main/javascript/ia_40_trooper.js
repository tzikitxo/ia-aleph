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

    Handlebars.registerHelper("joinForTrooperOption", function (context) {
        var res = '';
        if (context.skills.length > 0) {
            res += ' ' + context.skills.join(', ');
        }
        if (context.equipments.length > 0) {
            res += ' (' + context.equipments.join(', ') + ')';

        }
        return res;
    });
    Handlebars.registerHelper("trooperEquipments", function (context) {
        if (context.equipments.length > 0) {
            return 'Equipment: ' + context.equipments.join(' · ');
        } else {
            return '';
        }
    });
    Handlebars.registerHelper("trooperSkills", function (context) {
        if (context.skills.length > 0) {
            return 'Special Skills: ' + context.skills.join(' · ');
        } else {
            return '';
        }
    });

    var trooperSelectorTemplate = Handlebars.compile($('#ia-trooperSelectorTemplate').html());




    ui.trooperSelector = {
        showTrooperSelector: function (trooperCode) {
            trooperCode = trooperCode || 100;
            $('#ia-mainScreenCenter').html(trooperSelectorTemplate({
                trooper: data.findTrooperByCode(trooperCode),
                messages: {
                    name: 'Name',
                    bsw: "BS Weapons",
                    ccw: "CC Weapons",
                    swc: "SWC",
                    cost: "C",
                    mov: 'MOV',
                    cc: 'CC',
                    bs: 'BS',
                    ph: "PH",
                    wip: "WIP",
                    arm: "ARM",
                    bts: "BTS",
                    wounds: "W",
                    str: "STR",
                    silhouette: "S",
                    ava: "AVA"
                }
            }));
        }
    };


})();