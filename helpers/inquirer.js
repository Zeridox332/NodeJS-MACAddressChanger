require('colors');
const inquirer = require('inquirer');
const { getInterfaces, getFakeMacs } = require('./getInterfaces');

const selectInterface = async (manual = false, scanAll = false) => {
  let message;
  let choices;
  if (manual) {
    message = "Selecciona la interfaz para crear una MAC personalizada a la misma.";
    choices = getInterfaces(true)
  } else if (scanAll){
    message = "Selecciona la interfaz a reactivar";
    choices = getInterfaces(true, true)
  } else {
    message = "Selecciona una interfaz a la cual ponerle una MAC pre-definida \n(Si no aparece reactiva la interfaz usando 'Reactivar interfaz de red' y reinicia el programa)\n(EL PROGRAMA NO FUNCIONARÁ SI NO SE EJECUTA CON PRIVILEGIOS DE ADMINISTRADOR, ESTOS PRIVILEGIOS SE SOLICITAN AL EJECUTAR DESDE execute.bat).";
    choices = getInterfaces();
  }
    
  const questions = [
    {
      type: 'list',
      message,
      name: 'opcionInterfaz',
      choices
    }
  ]

  console.clear();
  console.log('=========================='.green);
  console.log('  Seleccione una opción'.white);
  console.log('==========================\n'.green);
  const { opcionInterfaz } = await inquirer.prompt(questions);
  return opcionInterfaz
}

const selectFakeMac = async () => {
  const questions = [
    {
      type: 'list',
      message: 'Selecciona la MAC que quieres usar (Esto cambiará la MAC de la interfaz seleccionada).',
      name: 'opcionMac',
      choices: getFakeMacs()
    }
  ]

  console.clear();
  console.log('=========================='.green);
  console.log('  Seleccione una opción'.white);
  console.log('==========================\n'.green);
  const { opcionMac } = await inquirer.prompt(questions);
  return opcionMac
}

const readMacInput = async (message) => {
  let macRegex = /([AaBbCcDdEeFf0-9]{2}[-]){5}([AaBbCcDdEeFf0-9]{2})/;
  const {desc} = await inquirer.prompt({
    type: 'input',
    name: 'desc',
    message,
    validate(value){
      if (value == "0") return true;
      if (!macRegex.test(value)) return 'Mac Incorrecta, escribe una MAC válida. EJ: 02-3F-A1-D5-53-12 (NOTA: Para el segundo valor se recomienda "2", "6" o "A")';
      return true;
    }
  });
  return desc
}

const pausa = async (err, info) => {
  let message;
  if (err) message = "Ocurrió un error, no se han realizado cambios en la interfaz, vuelve a ejecutar el programa.";
  else message = `Interfaz modificada correctamente, datos a continuación (Presiona ENTER para continuar):\n Directorio Interfaz: ${info.path} \n TransportID: ${info.valueNetCfgInstanceId} \n Mac Anterior: ${info.oldMac} \n Mac Nueva: ${info.newMac} \n Nombre Interfaz: ${info.deviceName}`;

  console.log('\n');
  await inquirer.prompt({
    type: 'input',
    name: 'pausa',
    message
  });
}

module.exports = {
  selectInterface,
  selectFakeMac,
  readMacInput,
  pausa
}
