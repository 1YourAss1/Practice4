'use strict';

let url = 'http://localhost:3000/small.csv';
let area = [];
let locality = []; let displayLocality = [];


class Territory {
    codes;
    level;
    name;
    constructor(codes, level, name) {
        this.codes = codes;
        this.level = level;
        this.name = name;
    }

    get code1() {
        return this.codes[0];
    }
    get code2() {
        return this.codes[1];
    }
    get code3() {
        return this.codes[2];
    }
    get code4() {
        return this.codes[3];
    }
}

let csvToTerritory = csvToTerritorySplit;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('selectCsvMethod').addEventListener('change', function() {
            switch(this.value) {
                case 'split':
                    csvToTerritory = csvToTerritorySplit;
                    break;
                case 'regex':
                    csvToTerritory = csvToTerritoryRegex;
                    break;
            }
            document.getElementById('areaTable').replaceChildren();
            document.getElementById('localityTable').replaceChildren();
            render();
    });

    function filter(value, id, type) {
        let regex = new RegExp(`${value}`, 'i');
        
        let filteredList = [];
        switch(type) {
            case 'reg':
                return filteredList = area.filter(locality => locality.code2 === '000' && regex.test(locality.name));
            case 'dis':
                return filteredList = area.filter(locality => locality.code2 !== '000' && regex.test(locality.name));
            case 'loc':
                return filteredList = displayLocality.filter(locality => locality.code2 !== '000' && locality.code3 !== '000' && regex.test(locality.name));
        }
    }

    function fillTable(list, id) {
        document.getElementById(id).replaceChildren();
        listToTable(list, id);
    }

    document.getElementById('regionInput').addEventListener('keyup', event => {
        if (event.target.value.length < 3) {
            fillTable(area, 'areaTable');
        } else {
            fillTable(
                filter(event.target.value, 'areaTable', 'reg'), 
                'areaTable');
        }
    });
    document.getElementById('districtInput').addEventListener('keyup', event => {
        if (event.target.value.length < 3) {
            fillTable(area, 'areaTable');
        } else {
            fillTable(
                filter(event.target.value, 'areaTable', 'dis'),
                'areaTable');
        }
        
    });
    document.getElementById('localityInput').addEventListener('keyup', event => {
        if (event.target.value.length < 2) {
            fillTable(displayLocality, 'localityTable');
        } else {
            fillTable(
                filter(event.target.value, 'localityTable', 'loc'),
                'localityTable');
        }
        
    });

    document.getElementById('areaTable').addEventListener('click', event => {
        let code1 = event.target.closest('tr').querySelectorAll('td.code1')[0].textContent;
        let code2 = event.target.closest('tr').querySelectorAll('td.code2')[0].textContent;

        displayLocality = [];
        document.getElementById('localityTable').replaceChildren();
        
        displayLocality = locality.filter(locality => locality.code1 === code1 && locality.code2 === code2);
        displayLocality.sort( (locality1, locality2) => {
            let name1 = locality1.name.match(/[А-ЯЁ].*/);
            let name2 = locality2.name.match(/[А-ЯЁ].*/);
            if (name1 > name2) return 1;
            if (name1 == name2) return 0;
            if (name1 < name2) return -1;
        });    
        listToTable(displayLocality, 'localityTable');

    });

    render();
});


async function render() {
    let list = await load();

    area = list.filter(locality => {
        return locality.code1 !== '00' && 
                !new RegExp('[1-9]00').test(locality.code2) &&
                locality.code3 === '000' &&
                locality.code4 === '000' && 
                locality.level === '1' 
        });

    locality = list.filter(locality => {
        return locality.code1 !== '00' && 
                locality.code3 !== '000' &&
                locality.code4 !== '000' &&
                locality.level === '2'
    });

    document.getElementById('areaTable').replaceChildren();
    listToTable(area, 'areaTable');
}

function load() {
    return fetch(url, {headers: {'Content-Type': 'text/plain'}})
            .then(response => response.text())
            .then(text => csvToTerritory(text));
}

function csvToTerritorySplit(text) {
    return text.split('\n').map(line => {
        line = line.split(";");

        let codes = [line[0].slice(1, -1), line[1].slice(1, -1), line[2].slice(1, -1), line[3].slice(1, -1)];
        let level = line[5].slice(1, -1);
        let name = line[6].slice(1, -1);

        return new Territory(codes, level, name);
    });
}

function csvToTerritoryRegex(text) {
    let result = [];
    let matches = text.matchAll(/"(?<code1>\d+)";"(?<code2>\d+)";"(?<code3>\d+)";"(?<code4>\d+)";".";"(?<level>\d+)";"(?<name>.*?)"/g);
    for (let match of matches) {
        let {code1, code2, code3, code4, level, name} = match.groups;
        result.push(new Territory([code1, code2, code3, code4], level, name));
    }
    return result
}

function listToTable(list, id) {
    let table = document.getElementById(id);

    list.forEach(locality => {
        let tr = document.createElement('tr');
        let td = document.createElement('td');

        for(let i = 0; i < locality.codes.length; i++) {
            td = document.createElement('td');
            td.textContent = locality.codes[i];
            td.classList.add(`code${i+1}`);
            tr.append(td);
        }

        // locality.codes.forEach(code => {
        //     let td = document.createElement('td');
        //     td.textContent = code;
        //     tr.append(td);
        // });

        td = document.createElement('td');
        td.textContent = locality.level;
        td.classList.add('nevel');
        tr.append(td);

        td = document.createElement('td');
        td.textContent = locality.name;
        td.classList.add('name');
        tr.append(td);

        table.append(tr);
    });
}
