const fs = require('fs');

const guardarDB = data => {

    fs.writeFileSync('./db/oldMacData.json', JSON.stringify(data));
}

const leerDB = () => {

    if (!fs.existsSync('./db/oldMacData.json')) return null;

    const data = fs.readFileSync('./db/oldMacData.json', {encoding: 'utf-8'});

    return JSON.parse(data);

}

module.exports = {
    guardarDB,
    leerDB
}