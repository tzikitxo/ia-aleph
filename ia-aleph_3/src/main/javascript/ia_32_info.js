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

    var hackingDisplayTemplate = Handlebars.compile($('#ia-hackingDisplayTemplate').html());

    ui.infoDisplay = {
        updateInfoDisplayForTrooper: function (trooper) {

            if (trooper.hasSkillOrEquipment('Hacker')) {

                var hackingDevice = null;

                $.each(trooper.allEquipments, function (i, equipment) {
                    hackingDevice = data.getHackingDeviceByName(equipment);
                    if (hackingDevice) {
                        return false;
                    }
                });

                $('#ia-hackingDisplayContainer').html(hackingDisplayTemplate({
                    programs: $.map(hackingDevice.getPrograms(), function (program) {
                        var attackMod;
                        if (typeof program.attackMod === 'number') {
                            attackMod = program.attackMod + ' (' + (trooper.wip + program.attackMod) + ')';
                        } else {
                            attackMod = program.attackMod;
                        }
                        return $.extend({}, program, {
                            attackMod: attackMod
                        });
                    }),
                    deviceName: hackingDevice.name,
                    messages: {
                        programType: "Program Type",
                        name: "Name",
                        attackMod: "Attack MOD",
                        opponentMod: "Opponent MOD",
                        damage: "Damage",
                        burst: "B",
                        target: "Target",
                        skillType: "Skill Type",
                        special: "Special"
                    }
                }));

                $('#ia-hackingDisplayContainer .ia-infoDownButton').on('click', function () {
                    $('#ia-hackingDisplayContainer').hide('fast');
                });

                $('#ia-hackingDisplayButton').show().on('click', function () {
                    $('#ia-hackingDisplayContainer').show('fast');
                });
            } else {
                $('#ia-hackingDisplayContainer').hide();
                $('#ia-hackingDisplayButton').off('click').hide();
            }

        }
    }

})();
