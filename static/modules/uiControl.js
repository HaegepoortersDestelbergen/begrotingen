import {pricify, periodDifference, classSwitch} from './utils'
import {node, Element, returnNode} from 'cutleryjs'
import {budget, costs, search} from './dataControl'
import moment from 'moment';
import 'moment/locale/nl-be';
import { Modal, Collapse } from 'bootstrap';
import {kap, wel, wol, jgv, giv, grl, demo} from '../../static/modules/svgs';
import {user, domAccess} from './userControl';
import { admin } from './adminPane';
import { router } from '../..';

moment.locale('nl-be');

const render = {    
    init() {
        forms.setDates();
    },
    
    async budgets(group = window.appSettings.group) {
        window.appSettings.group = group;
        
        render.init();
        
        // switch to budget listing
        templates.switch('budgetsListing', (context) => {
            context.editContext('group', group)
        });
        
        const data = await budget.getAll(group);
        const recordCount = data.length;
        render.resetListingField(node('[data-label="budgetsList"]'), recordCount)
        
        data.forEach(doc => {
            render.budget(doc);
        })
        
       router.navigate(`/takken/${group}`);
    },
    
    budget(doc, insertBefore = false) {
        render.init();
        
        const item = new Element('a');
        item.class(['list__item', 'item']);
        item.attributes([
            ['data-firebase', doc.id],
            ['href', `/budgets/${doc.id}`],
            ['data-navigo', ``]
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
                        <small>${doc.data.people.paying + doc.data.people.free} personen</small>
                    </div>
                </div>
            </div>
        `);
        if (insertBefore == false) item.append('[data-section="step2"] [data-label="budgetsList"]');
        else if (insertBefore == true) item.prepend('[data-section="step2"] [data-label="budgetsList"]');
    },
    
    updatedBudget(data) {
        console.log(data);
        const meta = `
            ${moment(data.period.start).format('D MMM')} tot ${moment(data.period.end).format('D MMM')}
            – ${data.people.paying + data.people.free} personen
        `;
        
        templates.editContext('title', data.title, false);
        templates.editContext('meta', meta, false);
        templates.editContext('comments', data.comment, false);
    },
    
    async costs(inputData = window.appSettings.selectedBudget, mode = null) {
        const budgetsData = inputData;
                
        templates.switch('costsListing', (context) => {
            context.editContext('title', budgetsData.data.title);
            context.editContext('meta', `
                ${moment.unix(budgetsData.data.period.start.seconds).format('D MMM')} tot ${moment.unix(budgetsData.data.period.end.seconds).format('D MMM')}
                – ${budgetsData.data.people.paying + budgetsData.data.people.free} personen
            `);
            context.editContext('comments', budgetsData.data.comment);
        });
        
        const data = await costs.getAll(inputData.id);
        const recordCount = data.length;
        render.resetListingField(node('[data-label="costsList"]'), recordCount)
        
        data.forEach(doc => {
            const item = render.cost(doc);
            item.append('[data-section="step3"] [data-label="costsList"]');
        })
        
        render.budgetEditForm(budgetsData.data);
            
        router.updatePageLinks();
    },
    
    cost(doc, insertBefore = false) {
        const item = new Element('div');
        
        const data = doc.data;
        contextSwitch.setType(data.type);
        const cost = costs.calculateCost(data.amount, data.when, data.type)
        const price = contextSwitch.price(data.amount, data.when);
        if (data.type != 'income') render.totalBudget(budget.addCost({id: doc.id, cost: cost}));
        
        item.class(['list__item', 'item', 'animate__animated', 'animate__faster', 'animate__fadeIn']);
        item.attributes([
            ['data-firebase', doc.id],
        ])
        item.inner(`
        <div class="item__wrapper" data-toggle="collapse" data-target="[data-collapse='${doc.id}']">
            <div class="item__icon">${render.costIcon(data.category)}</div>
            <div class="item__body body">
                <div class="body__prepend">
                    <h5 class="title mb-0">${data.title}</h5>
                    ${data.comment != '' ? `<small class="comment">${data.comment}</small>` : ``}
                </div>
                <div class="body__append">
                    <h5>${price} euro</h5>
                    <small>${contextSwitch.priceComment()}</small>
                </div>
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
                        <button class="btn btn--sub btn--icon" data-action="deleteCost" data-readmode="remove" data-sharemode="remove"><i class='bx bx-trash-alt'></i> Verwijderen</button>
                            <button class="btn" data-action="editCost" data-readmode="remove" data-sharemode="remove">Bewerken</button>
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
    
    costIcon(cat) {     
        cat = cat != undefined ? cat : 'other';
        const icon = {
            shopping: 'bx-shopping-bag',
            food: 'bx-restaurant',
            location: 'bx-building-house',
            drinks: 'bx-drink',
            transport: 'bx-train',
            night: 'bx-bed',
            insurance: 'bx-check-shield',
            gwe: 'bx-plug',
            other: 'bx-coin',
        }[cat];
        
        return `<i class='bx ${icon}'></i>`
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
    
    costEditForm(costData) {
        // const id = window.appSettings.edit.cost = node.dataset.firebase;
        
        return `
            <hr class="mx-0 my-4">
            <form>
                <div class="row mb-4">
                    <div class="col">
                        <input class="form-control h5" type="text" id="newCost_title" name="title" autocomplete="none" value="${costData.data.title}">
                        <input class="form-control small" type="text" name="comments" value="${costData.data.comment}">
                    </div>
                </div>
                <div class="row mb-4">
                    <div class="col-12" data-label="previewNewCostIcons">
                        <div class="form-label">Categorie</div>
                        <div class="wrapper">
                            <label>
                                <input type="radio" name="category" value="shopping" checked>
                                <i class='bx bx-shopping-bag'></i>
                                Inkopen
                            </label>
                            <label>
                                <input type="radio" name="category" value="food">
                                <i class='bx bx-restaurant'></i>
                                Eten
                            </label>
                            <label>
                                <input type="radio" name="category" value="location">
                                <i class='bx bx-building-house'></i>
                                Locatie
                            </label>
                            <label>
                                <input type="radio" name="category" value="drinks">
                                <i class='bx bx-drink'></i>
                                Drank
                            </label>
                            <label>
                                <input type="radio" name="category" value="transport">
                                <i class='bx bx-train'></i>
                                Transport
                            </label>
                            <label>
                                <input type="radio" name="category" value="night">
                                <i class='bx bx-bed'></i>
                                Nacht
                            </label>
                            <label>
                                <input type="radio" name="category" value="insurance">
                                <i class='bx bx-check-shield'></i>
                                Verzekering
                            </label>
                            <label>
                                <input type="radio" name="category" value="gwe">
                                <i class='bx bx-plug'></i>
                                GWL
                            </label>
                            <label>
                                <input type="radio" name="category" value="other">
                                <i class='bx bx-coin'></i>
                                Andere
                            </label>
                        </div>
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
    },
    
    budgetEditForm(budgetData) {
        const form = node('[data-form="editBudget"]');
        
        if (form) {
            form.querySelector('[name="title"]').value = budgetData.title;
            form.querySelector('[name="comments"]').value = budgetData.comment;
            form.querySelector('[name="period-start"]').value = moment.unix(budgetData.period.start.seconds).format('yyyy-MM-DD')
            form.querySelector('[name="period-end"]').value = moment.unix(budgetData.period.end.seconds).format('yyyy-MM-DD')
            form.querySelector('[name="people-paying"]').value = budgetData.people.paying;
            form.querySelector('[name="people-free"]').value = budgetData.people.free;
        }
    },
    
    resetListingField(node, recordCount) {
        if (node) {
            if (recordCount > 0) node.innerHTML = '';
            else templates.showError(node);
            templates.watchForError(node);
        }
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
        share: false,
        admin: false
    },
    
    init() {
        ui.svgReplacement();
        ui.generateCredits();
        ui.detectChanges((watch) => {
            user.setRoleForm();
            router.updatePageLinks();
        })
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
            demo: document.querySelectorAll('img[data-src="tak_demo.svg"]'),
        }
        
        takImages.kap.forEach(img => {img.outerHTML = kap})
        takImages.wel.forEach(img => {img.outerHTML = wel})
        takImages.wol.forEach(img => {img.outerHTML = wol})
        takImages.jgv.forEach(img => {img.outerHTML = jgv})
        takImages.giv.forEach(img => {img.outerHTML = giv})
        takImages.grl.forEach(img => {img.outerHTML = grl})
        takImages.demo.forEach(img => {img.outerHTML = demo})
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
        ui.modes.read = bool;
        
        if (bool == true || ui.modes.read == true) {
            const nodesToHide = [
                node('[data-form="newCost"]'),
                // node('[data-form="newBudget"]'),
                // node(`[data-target="[data-collapse='newBudgetMeta']"]`),
                node(`[data-target="[data-modal='budgetShare']"`),
                ...node('[data-readmode="remove"]', true)
            ]
            
            nodesToHide.map(n => {
                if (n) n.remove();
            })
        } else bool == false
        
        return ui.modes.read
    },
    
    adminMode(bool) {
        if (bool) ui.modes.admin = bool;
        
        const $adminModal = node('.modal[data-modal="adminPane"] .modal-content-wrapper');
        const pane = templates.return('adminPane').outerHTML;
        const error = templates.return('adminPaneError').outerHTML;
        
        if (ui.modes.admin == true) {
            $adminModal.innerHTML = pane;
        }
        //  else if (ui.modes.admin == false) {
        //     $adminModal.innerHTML = error;
        // }
        
        return ui.modes.admin
    },
    
    detectChanges(callback) {
        const elementToObserve = returnNode('body');
        const observer = new MutationObserver((watch) => {           
            callback(watch);
        });
        observer.observe(elementToObserve, {subtree: true, childList: true});
    }
}

const contextMenu = {
    state: 0,
    
    menu() {
        const menu = node('[data-label="contextMenu"]');
        const styles = window.getComputedStyle(menu);
        return menu;
    },
    
    open(x, y) {
        this.state = 1
        
        const menu = node('[data-label="contextMenu"]');
        classSwitch(menu, 'd-none', 'd-block');
    },
    
    close() {
        this.state = 1
        
        const menu = node('[data-label="contextMenu"]');
        classSwitch(menu, 'd-block', 'd-none');
    },
    
    moveTo(x, y) {
        
    }
}

const templates = {
    getTemplate(templateName) {
        return node(`template[data-template="${templateName}"]`);
    },
    
    switch(templateName, callback, afterLoad = false) {
        // get template
        const temp = templates.getTemplate(templateName);
        
        // get template html
        this.templateHTML = temp.content.cloneNode(true).querySelector('*');
        const app = node('#app');
        
        // execute callback after or before app html is set
        if (callback && afterLoad == false) callback(this);
        app.innerHTML = this.templateHTML.outerHTML;
        if (callback && afterLoad == true) callback(this);
        
        // add ui
        ui.init();
        // user.accessControl();
        domAccess.init();
        
        // initialize search functions
        search.init();
        
        // set site title
        const siteTitle = seo.siteTitles(templateName)
        seo.setTitle(siteTitle);
        
        // navigo
        router.updatePageLinks();
    },
    
    editContext(contextCaller, text, fromTemplate = true) {
        const source = fromTemplate == true ? this.templateHTML : document;
        const context = source.querySelector(`[data-template-context="${contextCaller}"]`);
        if (context) context.innerHTML = text;
    },
    
    editNode(contextCaller, fromTemplate = true) {
        const source = fromTemplate == true ? this.templateHTML : document;
        const context = source.querySelector(`[data-template-context="${contextCaller}"]`);
        if (context) return context;
    },
    
    return(templateName) {
        const temp = templates.getTemplate(templateName);
        return temp.content.cloneNode(true).querySelector('*');
    },
    
    showError(element) {
        element = returnNode(element);
        
        // remove loader if it exists
        if (element) {
            const loader = element.querySelector('.spinner-border');
            if (loader) loader.remove();
            
            const message = templates.return('listItemNotFound');
            element.append(message);
        }
        
        // templates.watchForError(element);
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
            // if (childCount == 0) templates.showError(elementToObserve);
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

const seo = {
    siteTitles(templateName) {
        const group = window.appSettings.group ? window.appSettings.group : 'groep';
        const costTitle = window.appSettings.selectedBudget ? window.appSettings.selectedBudget.data.title : 'kost'
        const title = {
            userLogIn: 'aanmelden',
            groupSelect: 'takken',
            budgetsListing: group,
            costsListing: `${costTitle} - ${group}`,
            shareNotFound: 'oops'
        }[templateName];
        return title != '' ? title : 'overzicht';
    },
    
    setTitle(text = 'takken') {
        const title = node('title');
        title.innerHTML = `${text} | Begrotingen Haegepoorters`;
    }
}

const createToast = ({title, content, timer = 6000}) => {
    const animateDuraction = 2000;

    const toast = new Element('div');
    toast.class(['toast', 'animate__animated', 'animate__fadeInUp', 'animate__faster']);
    toast.inner(`
      <div class="toast__wrapper">
        <div class="toast__controls">
          <div data-action="closeToast">
            <i class='bx bx-x'></i>
          </div>
        </div>
        <div class="toast__content">
            ${title ? `<h5 class="toast__title">${title}</h5>` :  ''}
            ${content ? `
                <div class="toast__body">
                    <p>${content}</p>
                </div>
            ` : ''}
        </div>
      </div>
      <div class="toast__timer"></div>
    `);
    toast.attributes([
      ['style', `--timer-duration: ${timer}ms`]
    ])
    toast.append('#toasts .toasts__wrapper');
    setTimeout(() => {  
      fadeOutNode(toast.return());    
    }, timer)
    setTimeout(() => {      
      toast.return().remove();
    }, timer + animateDuraction)
}
  
const fadeOutNode = (el) => {
    el.classList.remove('animate__fadeInUp');
    el.classList.add('animate__fadeOutDown');
}

const notify = {}

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
    contextSwitch,
    createToast,
    fadeOutNode
}
