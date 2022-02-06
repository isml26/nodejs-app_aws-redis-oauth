const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory');

class CustomPage {
    constructor(page){
        this.page = page;
    }
    // generate new puppeteer page and create custom page ,combine together with proxy object
    static async build(){
        const browser = await puppeteer.launch({
            headless:false
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage,{
            get:function(target,property){
                return customPage[property] || browser[property] || page[property];
            }
        });
    }
    async login(userProps){
        const user = await userFactory(userProps);
        const {session ,sig} = sessionFactory(user);

        await this.page.setCookie({ name:'session',value:session });
        await this.page.setCookie({ name:'session.sig',value:sig });
        await this.page.goto('localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }
    async getContentsOf(selector){
        return this.page.$eval(selector,el=>el.innerHTML);
    }

}

module.exports = CustomPage;