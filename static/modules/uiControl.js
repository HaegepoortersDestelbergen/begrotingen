import {pricify, periodDifference} from './utils'
import {node, Element, returnNode} from 'cutleryjs'
import {budget, costs} from './dataControl'
import moment from 'moment';
import 'moment/locale/nl-be';
import { Modal, Collapse } from 'bootstrap';
import {kap, wel, wol, jgv, giv, grl} from '../../static/modules/svgs';
import {user} from './userControl';

moment.locale('nl-be');

const render = {    
    init() {
        forms.setDates();
    },
    
    async budgets() {
        render.init();
        
        templates.switch('budgetsListing', (context) => {
            context.editContext('group', window.appSettings.group)
        });
        const data = await budget.getAll();
        const recordCount = data.length;
        
        const $budgets = node('[data-label="budgetsList"]')
        if (recordCount > 0) $budgets.innerHTML = '';
        else templates.showError($budgets);
        
        data.forEach(doc => {
            render.budget(doc);
        })
    },
    
    budget(doc, insertBefore = false) {
        render.init();
        
        const item = new Element('div');
        item.class(['list__item', 'item']);
        item.attributes([
            ['data-firebase', doc.id]
        ])
        
        item.inner(`
            <div class="item__wrapper">
                <div class="item__icon">
                    <i class='bx bx-calendar-alt'></i>
                </div>
                <div class="item__body body">
                    <div class="body__prepend">
                        <span class="body__title">${doc.data.title}</span>
                        ${doc.data.comment != '' ? `<small class="body__comment">${doc.data.comment}</small>` : ``}
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
            </div>
        `);
        if (insertBefore == false) item.append('[data-section="step2"] [data-label="budgetsList"]');
        else if (insertBefore == true) item.prepend('[data-section="step2"] [data-label="budgetsList"]');
    },
    
    async costs(inputData = window.appSettings.selectedBudget, callback) {
        const budgetsData = inputData;
        
        templates.switch('costsListing', (context) => {
            context.editContext('title', budgetsData.data.title);
            context.editContext('meta', `
                ${moment.unix(budgetsData.data.period.start.seconds).format('D MMM')} tot ${moment.unix(budgetsData.data.period.end.seconds).format('D MMM')}
                – ${budgetsData.data.people.paying + budgetsData.data.people.free} personen
            `);
            context.editContext('comments', budgetsData.data.comment);
        });
        
        const data = await costs.getAll();
        const recordCount = data.length;
        
        const $costs = node('[data-label="costsList"]');
        if (recordCount > 0) $costs.innerHTML = '';
        else templates.showError($costs);
        
        data.forEach(doc => {            
            const item = render.cost(doc);
            item.append('[data-section="step3"] [data-label="costsList"]');
        })
        
        if (callback) callback();
    },
    
    cost(doc, insertBefore = false) {
        const item = new Element('div');
        contextSwitch.setType(doc.data.type);
        
        const cost = costs.calculateCost(doc.data.amount, doc.data.when, doc.data.type)
        const price = contextSwitch.price(doc.data.amount, doc.data.when);
        
        if (doc.data.type != 'income') render.totalBudget(budget.addCost({id: doc.id, cost: cost}));
        
        item.class(['list__item', 'item', 'animate__animated', 'animate__faster', 'animate__fadeIn']);
        item.attributes([
            ['data-firebase', doc.id]
        ])
        item.inner(`
            <div class="item__body body" data-toggle="collapse" data-target="[data-collapse='${doc.id}']">
                <div class="body__prepend">
                    <h5 class="title">${doc.data.title}</h5>
                    ${doc.data.comment != '' ? `<small class="comment">${doc.data.comment}</small>` : ``}
                </div>
                <div class="body__append">
                    <h5>${price} euro</h5>
                    <small>${contextSwitch.priceComment()}</small>
                </div>
            </div>
            <div class="collapse" data-collapse="${doc.id}" data-parent="[data-label='costsList']">
                <hr>
                <div class="item__behind">
                    <div class="row">
                        <div class="col-12 col-lg-4 mb-3 mb-lg-0">
                            <p class="mb-0">${contextSwitch.priceSinglePayer(price)}</p>
                            <small>${contextSwitch.priceSinglePayerComment()}</small>
                        </div>
                        <div class="col-12 col-lg-8 d-flex justify-content-end align-items-center">
                            <div class="btn-group ml-auto">
                            <button class="btn btn--sub btn--icon" data-action="deleteCost" data-sharemode="remove"><i class='bx bx-trash-alt'></i> Verwijderen</button>
                                <button class="btn" data-action="editCost" data-sharemode="remove">Bewerken</button>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col" data-label="editCostForm">
                            <!-- editingform -->
                        </div>
                    </div>
                </div>
            </div>
        `)
        
        return item;
    },
    
    deleteCost(id) {
        const item = node(`[data-label="costsList"] .list__item[data-firebase="${id}"]`);
        item.addEventListener('animationend', () => {
            item.remove();
        });
        item.classList.add('animate__fadeOut');
        
        budget.removeCost(id);
        render.totalBudget();
    },
    
    totalBudget(amount = budget.returnTotal()) {
        node('[data-template-context="priceTotal"]').innerHTML = pricify(amount);
        node('[data-template-context="priceSinglePayer"]').innerHTML = pricify(amount/window.appSettings.selectedBudget.data.people.paying) + ' per persoon';
    },
    
    async costEditForm(costData) {
        // const id = window.appSettings.edit.cost = node.dataset.firebase;
        
        return `
            <hr class="mx-0 my-4">
            <form>
                <div class="row mb-4">
                    <div class="col">
                        <input class="form-control h5" type="text" id="newCost_title" name="title" autocomplete="none" value="${costData.data.title}">
                        <input class="form-control small w-50" type="text" name="comments" value="${costData.data.comment}">
                    </div>
                </div>
                <div class="row"> 
                    <div class="col">
                        <div class="form-label">Bedrag €</div>
                        <input class="form-control" name="amount" type="number" step=".01" id="newCost_amount" value="${costData.data.amount}">
                    </div>
                    <div class="col">
                        <div class="form-label">Type</div>
                        <select class="form-select" name="type" aria-label="Default select example">
                            <option value="fixed">Vaste kost</option>
                            <option value="per-person">Kost per persoon</option>
                            <option value="per-payer">Kost per betalende persoon</option>
                            <option value="per-free">Kost per gratis persoon</option>
                            <option value="income">Inkomst</option>
                        </select>
                    </div>
                    <div class="col">
                        <div class="form-label">Hoe vaak</div>
                        <select class="form-select" name="when" aria-label="Default select example">
                            <option value="onetime">Eenmalig</option>
                            <option value="per-day">Per dag</option>
                            <option value="per-night">Per nacht</option>
                        </select>
                    </div>
                </div>
                <div class="btn-group mt-4 ml-auto" data-toggle="collapse" data-target="[data-collapse='${costData.id}']">
                    <button type="reset" class="btn btn--sub">Annuleren</button>
                    <button type="submit" class="btn btn--main">Kost updaten</button>
                </div>
            </form>
        `;
    }
}

const contextSwitch = {
    setType(type) {
        this.costType = type
    },
    
    priceComment() {
        switch (this.costType) {
            case 'fixed':
                return 'Vaste kost, ongeacht aantal personen'
                break;
            case 'per-person':
                return 'Totaalkost, alle personen'
                break;
            case 'per-payer':
                return 'Totaalkost, betalende personen'
                break;
            case 'per-free':
                return 'Totaalkost, niet-betalende personen'
                break;
            case 'per-free':
                return 'Inkomsten, wordt afgetrokken van totaal'
                break;
        
            default:
                break;
        }
    },
    
    whenCalculations(when) {
        const budgetData = window.appSettings.selectedBudget.data;
        const period = periodDifference(budgetData.period.start.seconds, budgetData.period.end.seconds);
        
        switch (when) {
            case 'onetime':
                return 1
            case 'per-day':
                return period.days
            case 'per-night':
                return period.nights
                
            default:
                break;
        }
    },
    
    price(price, when) {       
        switch (this.costType) {
            case 'fixed':
                return '+' + costs.calculateCost(price, when, this.costType)
                break;
            case 'per-person':
                return '+' + costs.calculateCost(price, when, this.costType)
                break;
            case 'per-payer':
                return '+' + costs.calculateCost(price, when, this.costType)
                break;
            case 'per-free':
                return '+' + costs.calculateCost(price, when, this.costType)
                break;
            case 'income':
                return '-' + costs.calculateCost(price, when, this.costType)
                break;
        
            default:
                break;
        }
    },
    
    priceSinglePayer(price) {
        const budgetData = window.appSettings.selectedBudget.data;
        
        switch (this.costType) {
            case 'fixed':
                return `Uitgave van <strong>${pricify(price/(budgetData.people.paying))} per persoon</strong>`
                break;
            case 'per-person':
                return `Uitgave van <strong>${pricify(price/(budgetData.people.paying))} per persoon</strong>`
                break;
            case 'per-payer':
                return `Uitgave van <strong>${pricify(price/(budgetData.people.paying))} per persoon</strong>`
                break;
            case 'per-free':
                return `Uitgave van <strong>${pricify(price/(budgetData.people.paying))} per persoon</strong>`
                break;
            case 'income':
                return `Totale inkomst van <strong>${price} euro</strong>`
                break;
        
            default:
                break;
        }
    },
    
    priceSinglePayerComment() {
        switch (this.costType) {
            case 'fixed':
                return 'Kost voor heel de groep, verekend per betalende persoon'
                break;
            case 'per-person':
                return 'Kost voor elke persoon uit de groep, verekend per betalende persoon'
                break;
            case 'per-payer':
                return 'Kost voor elke betalende persoon uit de groep, verekend per betalende persoon'
                break;
            case 'per-free':
                return 'Kost voor elke niet-betalende persoon uit de groep, verekend per betalende persoon'
                break;
            case 'income':
                return 'Deze inkomsten worden afgetrokken van het totaal van deze begroting'
                break;
        
            default:
                break;
        }
    }
}

const ui = {
    modes: {
        read: false,
        share: false
    },
    
    init() {
        ui.svgReplacement();
        ui.generateCredits();
    },
    
    generateCredits() {
        const projectData = require('../../package.json');
        const credits = node('#credits');
        if (credits) credits.innerHTML = `Versie ${projectData.version} — <a href="">Ondersteuning krijgen</a> — ontwikkeld door ${projectData.author}`
    },
    
    svgReplacement() {
        const takImages = {
            kap: document.querySelectorAll('img[data-src="tak_kap.svg"]'),
            wel: document.querySelectorAll('img[data-src="tak_wel.svg"]'),
            wol: document.querySelectorAll('img[data-src="tak_wol.svg"]'),
            jgv: document.querySelectorAll('img[data-src="tak_jgv.svg"]'),
            giv: document.querySelectorAll('img[data-src="tak_giv.svg"]'),
            grl: document.querySelectorAll('img[data-src="tak_grl.svg"]'),
        }
        
        takImages.kap.forEach(img => {img.outerHTML = kap})
        takImages.wel.forEach(img => {img.outerHTML = wel})
        takImages.wol.forEach(img => {img.outerHTML = wol})
        takImages.jgv.forEach(img => {img.outerHTML = jgv})
        takImages.giv.forEach(img => {img.outerHTML = giv})
        takImages.grl.forEach(img => {img.outerHTML = grl})
    },
    
    shareMode(bool) {    
        ui.modes.share = bool;
         
        if (bool == true) {
            const itemsToHide = [
                node('[data-form="newCost"]'),
                node('[data-label="costsTopActions"]'),
                ...node('[data-sharemode="remove"]', true)      
            ]
            itemsToHide.map(n => {if (n) n.remove()})
        }
        
        return ui.modes.share;
    },
    
    readMode(bool) {
        console.log('readmode', bool || ui.modes.read);
        ui.modes.read = bool;
        
        if (bool == true || ui.modes.read == true) {
            const nodesToHide = [
                node('[data-form="newCost"]'),
                node('[data-form="newBudget"]'),
                node(`[data-target="[data-collapse='newBudget']"]`),
                node(`[data-target="[data-modal='budgetShare']"]`),
            ]
            
            nodesToHide.map(n => {
                if (n) n.remove();
            })
        } else bool == false
        
        return ui.modes.read
    }
}

const templates = {
    getTemplate(templateName) {
        this.template = node(`template[data-template="${templateName}"]`);
    },
    
    switch(templateName, callback, afterLoad = false) {
        templates.getTemplate(templateName);
        
        this.templateHTML = this.template.content.cloneNode(true).querySelector('*');
        const app = node('#app');
        
        if (callback && afterLoad == false) callback(this);
        app.innerHTML = this.templateHTML.outerHTML;
        if (callback && afterLoad == true) callback(this);
        
        ui.init();
    },
    
    editContext(contextCaller, innerHTML) {
        const context = this.templateHTML.querySelector(`[data-template-context="${contextCaller}"]`);
        context.innerHTML = innerHTML;
    },
    
    return(templateName) {
        templates.getTemplate(templateName);
        return this.template.content.cloneNode(true).querySelector('*');
    },
    
    showError(element) {
        console.log('show error')
        element = returnNode(element);
        
        // remove loader if it exists
        const loader = element.querySelector('.spinner-border');
        if (loader) loader.remove();
        
        const message = templates.return('listItemNotFound');
        console.log(message);
        element.append(message);
        
        templates.watchForError(element);
    },
    
    removeError(element) {
        element = returnNode(element);
        const message = element.querySelector('.list__not-found');
        if (message) message.remove();
    },
    
    watchForError(element) {
        const elementToObserve = returnNode(element);
        const observer = new MutationObserver((watch) => {           
            const childCount = elementToObserve.querySelectorAll('.list__item').length;
            
            const added = watch[0].addedNodes.length;
            const removed = watch[0].removedNodes.length;
            
            if (added != 0) templates.removeError(elementToObserve);
            if (childCount == 0) templates.showError(elementToObserve);
        });
        observer.observe(elementToObserve, {subtree: true, childList: true});
    }
}

const forms = {
    setDates() {
        const dates = node('[data-date="now"]', true);
        dates.forEach(n => {
            n.valueAsDate = new Date();
        })
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
    templates,
    contextSwitch
}
