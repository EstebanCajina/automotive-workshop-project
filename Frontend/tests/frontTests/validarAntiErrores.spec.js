const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('Validar que no permita subir cosas con errores', function () {
    this.timeout(60000);
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

    // Función auxiliar para esperar y interactuar con un elemento
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


    it('Validar que no permita subir cosas con errores', async function () {
        try {
            await driver.get("http://localhost:4000/dashboard");
            await driver.manage().window().setRect({ width: 1050, height: 652 });
            // Usar la función waitAndInteract para cada interacción
            await waitAndInteract(By.name('username'), 'sendKeys', 'Marley_Solis_Solorzano');
            await waitAndInteract(By.name('password'), 'sendKeys', 'pitufo18');
            await waitAndInteract(By.css('.btn'), 'click');
            
            console.log('Verificando que el login fue exitoso...');
            await driver.wait(until.urlIs('http://localhost:4000/dashboard'), 10000);
            console.log('Login exitoso.');

            await waitAndInteract(By.linkText('Horarios'), 'click');
            await waitAndInteract(By.linkText('Subir horarios excel'), 'click');
            let filePath = path.resolve(__dirname, '../archivos_de_prueba/1_StandardReport Dixon con errores.xlsx');
            await waitAndInteract(By.id('fileInput'), 'sendKeys', filePath);
            await waitAndInteract(By.css('.btn-primary'), 'click');
            await waitAndInteract(By.css('.btn-success'), 'click');
            await waitAndInteract(By.css('.swal2-cancel'), 'click');
        
        } catch (error) {
            console.log('Error en la prueba', error);
        }
    });
});