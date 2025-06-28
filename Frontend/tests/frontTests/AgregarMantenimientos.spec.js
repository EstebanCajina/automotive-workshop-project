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

    it('deberia poder agregar un Mantenimiento con exito', async function() {
        this.timeout(60000); // Aumenta el timeout para esta prueba

        try {
            console.log('Abriendo la aplicación...');
            await driver.get('http://localhost:4000/dashboard'); // Cambia la URL a la página de dashboard

            console.log('Haciendo clic en "Vehículos"...');
            await waitAndInteract(By.linkText("Vehículos"), 'click');
            

            console.log('Haciendo clic en "area de mantenimientos"...');
            await waitAndInteract(By.linkText("Área de mantenimientos"), 'click');

await waitAndInteract(By.name("plate"), 'click');
await driver.sleep(6000);
await waitAndInteract(By.name("plate"), 'sendKeys', '679287');
await driver.sleep(6000);
await waitAndInteract(By.name("issue_description"), 'sendKeys', 'esto es una prueba');
await waitAndInteract(By.name("unit_mileage"), 'sendKeys', '190000');
await waitAndInteract(By.name("mileage_date"), 'sendKeys','20/01/2025');
await waitAndInteract(By.name("requires_platform_transfer"), 'click');
await waitAndInteract(By.name("under_warranty"), 'click');
await waitAndInteract(By.name("mechanic_contact"), 'sendKeys', 'Juancho');
await waitAndInteract(By.name("mechanic_phone"), 'sendKeys', '88888888');
await waitAndInteract(By.name("observations"), 'sendKeys','prueba con exito');

await waitAndInteract(By.name('Add_Vehicle'), 'click');
await waitAndInteract(By.css(".swal2-confirm"), 'click');


            console.log('Prueba completada exitosamente.');
        } catch (error) {
            console.error('Error en la prueba:', error);
            throw error;
        }
    });
});