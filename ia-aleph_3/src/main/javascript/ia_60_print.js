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

    var printTemplate = Handlebars.compile($('#ia-printTemplate').html());

    roster.printRoster = function (rosterData) {
        if (!rosterData) {
            rosterData = roster.getRosterData();
        }
        var trooperRecords = [], trooperRecordsByTrooperCode = {};
        $.each(rosterData.troopers, function (i, trooper) {
            if (!trooperRecordsByTrooperCode[trooper.troopercode]) {
                var trooperRecord = {
                    trooper: data.findTrooperByCode(trooper.troopercode),
                    options: [],
                    optionsByOptionCode: {}
                }
                trooperRecordsByTrooperCode[trooper.troopercode] = trooperRecord;
                trooperRecords.push(trooperRecord);
            }
            if (trooperRecordsByTrooperCode[trooper.troopercode].optionsByOptionCode[trooper.optioncode]) {
                trooperRecordsByTrooperCode[trooper.troopercode].optionsByOptionCode[trooper.optioncode].count++;
            } else {
                var option = {
                    trooper: trooper,
                    count: 1
                };
                trooperRecordsByTrooperCode[trooper.troopercode].optionsByOptionCode[trooper.optioncode] = option;
                trooperRecordsByTrooperCode[trooper.troopercode].options.push(option);
            }
        });
        var url = 'data:text/html;base64,' + btoa(printTemplate({
            title: 'Aleph Toolbox N3 Roster',
            baseurl: window.location.href.replace(/ia.html/, ''),
            roster: rosterData,
            trooperRecords: trooperRecords,
            faction: data.findFactionOrSectorialByCode(rosterData.factionCode),
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
                count:"Count"
            }
        }));
        window.open(url, '_blank');
    };



})();