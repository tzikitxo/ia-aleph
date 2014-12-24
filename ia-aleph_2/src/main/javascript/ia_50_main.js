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


var trooperSelectorTemplate = Handlebars.compile($('#ia-trooperSelectorTemplate').html());
$('#ia-mainContainer').html(trooperSelectorTemplate({
    trooper: {
        isc: 'Fusilers',
        classification: 'Line Troops',
        type: 'LI',
        options: [{
                name: 'Fusilier',
                skillsAndEquips: '',
                bsw: 'Combi Rifle',
                ccw: 'Pistol, Knife',
                swc: '0',
                c: '10'
            },{
                name: 'Fusilier',
                skillsAndEquips: 'Lieutenant',
                bsw: 'Combi Rifle',
                ccw: 'Pistol, Knife',
                swc: '0',
                c: '10'
            },{
                name: 'Fusilier',
                skillsAndEquips: '',
                bsw: 'HMG',
                ccw: 'Pistol, Knife',
                swc: '1',
                c: '18'
            }]
    }, messages: {
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
        silhouette: "S",
        ava: "AVA"
    }
}));

$('#ia-loadingContainer').hide('fast', function () {
    $('#ia-mainContainer').show('fast');
});