const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('Corregir errores', function() {
    this.timeout(60000); // Aumenta el timeout global a 60 segundos

    let driver;

    before(async function() {
        this.timeout(60000); // Aumenta el timeout para el hook before
        console.log('Iniciando el navegador...');
        let options = new chrome.Options();
        options.addArguments('--use-fake-ui-for-media-stream'); // Evita alertas de permisos

const chromeDriverPath = path.resolve(__dirname,'../../driver/chromedriver.exe');
        try {
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
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

    afterEach(async function() {
        
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

    it('Corregir errores', async function() {
        this.timeout(60000); // Aumenta el timeout para esta prueba

        try {
            console.log('Paso 1: Abrir la página de login...');
            await driver.get('http://localhost:4000/login');
           
            console.log('Paso 2: Establecer el tamaño de la ventana a 1050x652...');
            await driver.manage().window().setRect({ width: 1050, height: 652 });
            
            console.log('Paso 3: Ingresar nombre de usuario...');
            await waitAndInteract(By.name('username'), 'sendKeys', 'Marley_Solis_Solorzano');
            
            console.log('Paso 4: Ingresar contraseña...');
            await waitAndInteract(By.name('password'), 'sendKeys', 'pitufo18');
      
            console.log('Paso 5: Hacer clic en el botón de login...');
            await waitAndInteract(By.css('.btn'), 'click');
           
            console.log('Paso 6: Verificar que el login fue exitoso...');
            await driver.wait(until.urlIs('http://localhost:4000/dashboard'), 10000);
            console.log('Login exitoso.');
           
            console.log('Paso 7: Hacer clic en el menú "Horarios"...');
            await waitAndInteract(By.linkText('Horarios'), 'click');
            
            console.log('Paso 8: Hacer clic en "Subir horarios excel"...');
            await waitAndInteract(By.linkText('Subir horarios excel'), 'click');
            
            console.log('Paso 9: Subir el archivo "1_StandardReport Dixon con errores.xlsx"...');
            await waitAndInteract(By.id('fileInput'), 'sendKeys', path.resolve(__dirname, '../archivos_de_prueba/1_StandardReport Dixon con errores.xlsx'));
            
            console.log('Paso 10: Hacer clic en el botón de subida...');
            await waitAndInteract(By.css('.btn-primary'), 'click');
           
            console.log('Paso 11: Hacer clic en el botón de corrección...');
            await waitAndInteract(By.css('.btn:nth-child(3)'), 'click');
           
            console.log('Paso 12: Corregir el valor del campo inválido...');
            await waitAndInteract(By.css('.is-invalid'), 'click');
            let campo = await driver.findElement(By.css('td:nth-child(5) > .form-control'));
            await campo.click();
            await campo.clear();
            let value = await campo.getAttribute('value');
            if (value !== '') {
                console.log('El campo no se limpió correctamente.');
                await campo.sendKeys(Key.CONTROL + 'a');
                await campo.sendKeys(Key.DELETE);
            }
            await campo.sendKeys('20:22:00');
            
            console.log('Paso 13: Hacer clic en el botón de corrección nuevamente...');
            await waitAndInteract(By.css('.btn:nth-child(3)'), 'click');
            
            console.log('Paso 14: Hacer clic en el botón de éxito...');
            await waitAndInteract(By.css('.btn-success'), 'click');
            
            console.log('Paso 15: Hacer clic en el botón de confirmación del SweetAlert...');
            await waitAndInteract(By.css('.swal2-confirm'), 'click');
           
            console.log('Paso 16: Verificar que el mensaje de éxito está visible...');
            await driver.wait(until.elementLocated(By.css('.swal2-success')), 10000);
            await driver.wait(until.elementIsVisible(driver.findElement(By.css('.swal2-success'))), 10000);
            await driver.findElement(By.css('.swal2-success'));
           
            console.log('se llenan los campos de las horas de almuerzo');
           

            for (let i = 1; i <= 20; i++) {
                await waitAndInteract(By.css(`tr:nth-child(${i}) > td:nth-child(5) > .form-control`), 'sendKeys', '3');
             
              let campo1= await driver.findElement(By.css(`tr:nth-child(${i}) > td:nth-child(6) > .form-control`));
              let value1 = await campo1.getAttribute('value');

                if(value1 !== ''){
                    console.log('El campo no se limpió correctamente.');
                    await campo1.sendKeys(Key.CONTROL + 'a');
                    await campo1.sendKeys(Key.DELETE);
                }
              await waitAndInteract(By.css(`tr:nth-child(${i}) > td:nth-child(6) > .form-control`), 'sendKeys', '2');  
                

              let campo2 =  await driver.findElement(By.css(`tr:nth-child(${i}) > td:nth-child(7) > .form-control`));
              let value2 = await campo2.getAttribute('value');

                if(value2 !== ''){
                    console.log('El campo no se limpió correctamente.');
                    await campo2.sendKeys(Key.CONTROL + 'a');
                    await campo2.sendKeys(Key.DELETE);
                }
              await waitAndInteract(By.css(`tr:nth-child(${i}) > td:nth-child(7) > .form-control`), 'sendKeys', '4');
                
            }

              await waitAndInteract(By.css('.btn-warning'), 'click');
            await waitAndInteract(By.css('.btn:nth-child(5)'), 'click');  
          //  await waitAndInteract(By.css('.btn-success'), 'click');
            

            console.log('Prueba completada exitosamente.');
        } catch (error) {
            console.error('Error en la prueba:', error);
            throw error;
        }
    });
});