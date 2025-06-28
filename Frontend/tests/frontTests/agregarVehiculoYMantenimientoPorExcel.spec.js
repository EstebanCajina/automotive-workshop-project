const { Builder, By, until, Key} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('Pruebas de la aplicación', function() {
    this.timeout(60000); // Aumenta el timeout global a 60 segundos

    let driver;

    before(async function() {
        this.timeout(60000); // Aumenta el timeout para el hook before
        console.log('Iniciando el navegador...');
        let options = new chrome.Options();
        options.addArguments('--use-fake-ui-for-media-stream'); // Evita alertas de permisos

        // Especifica la ruta de ChromeDriver
const chromeDriverPath = path.resolve(__dirname,'../../driver/chromedriver.exe');

        try {
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .setChromeService(new chrome.ServiceBuilder(chromeDriverPath)) // Usa la ruta de ChromeDriver
                .build();
            console.log('Navegador iniciado correctamente.');
        } catch (error) {
            console.error('Error al iniciar el navegador:', error);
            throw error;
        }
    });

    after(async function() {
        if (driver) {
            console.log('Cerrando el navegador...');
            await driver.quit();
            console.log('Navegador cerrado correctamente.');
        }
    });

    

    async function waitAndInteract(locator, action, value = null) {
        await driver.wait(until.elementLocated(locator), 10000); // Esperar a que el elemento esté ubicado
        const element = await driver.findElement(locator);
        await driver.wait(until.elementIsVisible(element), 10000); // Esperar a que el elemento sea visible

        // Desplazar el elemento a la vista
        await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", element);

        // Esperar a que el elemento esté habilitado
        await driver.wait(until.elementIsEnabled(element), 10000);

        if (action === 'click') {
            await driver.executeScript("arguments[0].click();", element); // Hacer clic mediante JavaScript
        } else if (action === 'sendKeys') {
            await element.sendKeys(value);
        } else if (action === 'getText') {
            return await element.getText();
        }
    }

    it('debería loguearse correctamente', async function() {
        this.timeout(60000); // Aumenta el timeout para esta prueba

        try {
            console.log('Abriendo la página de login...');
            await driver.get('http://localhost:4000/login'); // Cambia la URL a la página de login

            // Maximiza el navegador
            await driver.manage().window().maximize();

            console.log('Ingresando credenciales...');
            await waitAndInteract(By.name('username'), 'sendKeys', 'Marley_Solis_Solorzano');

            await waitAndInteract(By.name('password'), 'sendKeys', 'pitufo18');

            console.log('Haciendo clic en el botón de login...');
            await waitAndInteract(By.css('.btn'), 'click');

            console.log('Verificando que el login fue exitoso...');
            await driver.wait(until.urlIs('http://localhost:4000/dashboard'), 10000);
            console.log('Login exitoso.');
        } catch (error) {
            console.error('Error en la prueba de login:', error);
            throw error;
        }
    });

    it('deberia poder subir un archivo de excel y permitir guardar un vehiculo y un mantenimiento', async function() {
        this.timeout(60000); // Aumenta el timeout para esta prueba

        try {
            console.log('Abriendo la aplicación...');
            await driver.get('http://localhost:4000/dashboard'); // Cambia la URL a la página de dashboard

            console.log('Haciendo clic en "Vehículos"...');
            await waitAndInteract(By.linkText("Vehículos"), 'click');
            

            console.log('Haciendo clic en "Subir horarios excel"...');
            await waitAndInteract(By.linkText("Subir archivo excel"), 'click');
           

            console.log('Subiendo el archivo...');
            let filePath = path.resolve(__dirname, '../archivos_de_prueba/Copia de Solicitud de mantenimiento.xlsx');
            await waitAndInteract(By.id('fileInput'), 'sendKeys', filePath);
            

            console.log('Haciendo clic en el botón de subida...');
            await waitAndInteract(By.css('.btn-primary'), 'click');
         
         await waitAndInteract(By.css('.btn:nth-child(3)'), 'click');

let campo = await driver.findElement(By.css("td:nth-child(1) > .form-control"))
let value = await campo.getAttribute('value')

if(value !== ''){
    console.log('El campo no está vacío');
    await campo.sendKeys(Key.CONTROL + 'a');
    await campo.sendKeys(Key.DELETE);
}
await waitAndInteract(By.css("td:nth-child(1) > .form-control"), 'sendKeys', 'CariTo');

let campo2 = await driver.findElement(By.css("td:nth-child(3) > .form-control"));
let value2 = await campo2.getAttribute('value');

if(value2 !== ''){
    console.log('El campo no está vacío');
    await campo2.sendKeys(Key.CONTROL + 'a');
    await campo2.sendKeys(Key.DELETE);
}

await waitAndInteract(By.css("td:nth-child(3) > .form-control"), 'sendKeys', '098721');

await waitAndInteract(By.css("td:nth-child(4) > .form-control"), 'click');

let campo3 = await driver.findElement(By.css("td:nth-child(4) > .form-control"));
let value3 = await campo3.getAttribute('value');

if(value3 !== ''){
    console.log('El campo no está vacío');
    await campo3.sendKeys(Key.CONTROL + 'a');
    await campo3.sendKeys(Key.DELETE);
}

await waitAndInteract(By.css("td:nth-child(4) > .form-control"), 'sendKeys', 'AbC');

let campo4 = await driver.findElement(By.css("td:nth-child(8) > .form-control"));
let value4 = await campo4.getAttribute('value'); 

if(value4 !== ''){
    console.log('El campo no está vacío');
    await campo4.sendKeys(Key.CONTROL + 'a');
    await campo4.sendKeys(Key.DELETE);
}

await waitAndInteract(By.css("td:nth-child(8) > .form-control"), 'sendKeys', '2008');

await waitAndInteract(By.css(".mt-3:nth-child(2)"), 'click');


            console.log('Prueba completada exitosamente.');
        } catch (error) {
            console.error('Error en la prueba:', error);
            throw error;
        }
    });
});