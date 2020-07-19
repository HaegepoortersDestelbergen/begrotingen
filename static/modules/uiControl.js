import {pricify} from './utils'
import {node, Element} from 'cutleryjs'
import {budget, costs} from './dataControl'
import moment from 'moment';
import 'moment/locale/nl-be';
import { Modal, Collapse } from 'bootstrap';
import {kap, wel, wol, jgv, giv} from '../../static/modules/svgs';
// import {app} from '../../index.js'

moment.locale('nl-be');

const render = {
    async budgets(tak) {
        const data = await budget.getAll(tak);
        data.forEach(doc => {
            const item = new Element('div');
            item.class(['list__item', 'item']);
            item.attributes([
                ['data-firebase', doc.id]
            ])
            item.inner(`
                <div class="item__icon">
                    <i class='bx bx-calendar-alt'></i>
                </div>
                <div class="item__body body">
                    <div class="body__prepend">
                        <span class="body__title">${doc.data.title}</span>
                        <small class="body__comment">Een beetje commentaar</small>
                    </div>
                    <div class="body__append">
                        <span>
                            ${moment.unix(doc.data.period.end.seconds).format('D MMM')}
                            tot 
                            ${moment.unix(doc.data.period.start.seconds).format('D MMM')}
                        </span>
                        <small>3436 euro</small>
                    </div>
                </div>
            `);
            item.append('[data-section="step2"] [data-label="budgetsList"]');
        })
        console.log(data)
    },
    
    async costs() {
        const data = await costs.getAll();
        data.forEach(doc => {
            const budgetData = window.appSettings.selectedBudget.data;
            console.log(budgetData);
            
            const item = new Element('div');
            item.class(['list__item', 'item']);
            item.attributes([
                ['data-firebase', doc.id]
            ])
            item.inner(`
                <div class="item__body body" data-toggle="collapse" data-target="[data-collapse='${doc.id}']">
                    <div class="body__prepend">
                        <h5 class="title">${doc.data.title}</h5>
                        <small class="comment">${doc.data.comment}</small>
                    </div>
                    <div class="body__append">
                        <h5>+${pricify(doc.data.price)}</h5>
                        <small>Voor de hele groep, totaal van alle personen</small>
                    </div>
                </div>
                <div class="collapse" data-collapse="${doc.id}">
                    <hr>
                    <div class="item__behind">
                        <div class="row">
                            <div class="col-12 col-lg-4">
                                <p class="mb-2">Uitgave van <strong>${pricify(doc.data.price/(budgetData.people.free + budgetData.people.paying))} per persoon</strong></p>
                                <small>Voor elke persoon uit de groep, inclusief leiding of andere niet-betalende personen</small>
                            </div>
                            <div class="col-12 col-lg-8">
                                <button class="btn ml-auto mt-auto">Bewerken <i class='bx bx-chevron-down' ></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `)
            item.append('[data-section="step3"] [data-label="costsList"]');
        })
    }
}

const ui = {
    init() {
        ui.svgReplacement();
        ui.generateCredits();
    },
    
    generateCredits() {
        const projectData = require('../../package.json');
        const credits = node('#credits');
        if (credits) credits.innerHTML = `Versie ${projectData.version} — <a href="">Ondersteuning krijgen</a> — ontwikkeld door ${projectData.author}`
    },
    
    switch(templateName, callback) {
        const template = node(`template[data-template="${templateName}"]`);
        console.log(template);
        const templateInner = template.content.cloneNode(true).querySelector('*').outerHTML;
        const app = node('#app');
        
        // const section = node('#app > *');
        // if (section) section.classList.add('animate__animated', 'animate__faster', 'animate__fadeOut');
        app.innerHTML = templateInner;
        if (callback) callback();
    },
    
    svgReplacement() {
        const takImages = {
            kap: document.querySelectorAll('img[data-src="tak_kap.svg"]'),
            wel: document.querySelectorAll('img[data-src="tak_wel.svg"]'),
            wol: document.querySelectorAll('img[data-src="tak_wol.svg"]'),
            jgv: document.querySelectorAll('img[data-src="tak_jgv.svg"]'),
            giv: document.querySelectorAll('img[data-src="tak_giv.svg"]'),
        }
        
        takImages.kap.forEach(img => {img.outerHTML = kap})
        takImages.wel.forEach(img => {img.outerHTML = wel})
        takImages.wol.forEach(img => {img.outerHTML = wol})
        takImages.jgv.forEach(img => {img.outerHTML = jgv})
        takImages.giv.forEach(img => {img.outerHTML = giv})
    }
}

Array.from(document.querySelectorAll('.modal')).forEach(bsNode => new Modal(bsNode))
Array.from(document.querySelectorAll('.collapse')).forEach(bsNode => {
    new Collapse(bsNode, {
        toggle: false
    });
})

export {
    render,
    ui,
}
