import { By, until } from 'selenium-webdriver';

export default class BasePage {
    constructor(driver) {
        this.driver = driver;
    }

    async open(path) {
        await this.driver.get(`http://localhost:4200${path}`);
    }

    async click(selector) {
        const el = await this.driver.wait(until.elementLocated(By.css(selector)), 10000);
        await el.click();
    }

    async type(selector, text) {
        const el = await this.driver.wait(until.elementLocated(By.css(selector)), 10000);
        await el.sendKeys(text);
    }

    async getText(selector) {
        const el = await this.driver.wait(until.elementLocated(By.css(selector)), 10000);
        return el.getText();
    }
}
