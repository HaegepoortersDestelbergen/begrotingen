import {ui, templates, render} from './static/modules/uiControl';
import {budget, costs, extractFormData, data, search} from './static/modules/dataControl';
import {eventCallback, node, cookies, Element} from 'cutleryjs';
import moment from 'moment';
import 'moment/locale/nl-be';
import {shares} from './static/modules/sharesControl';
import {user} from './static/modules/userControl';
import {clickEvent} from './static/modules/utils';
import {Collapse} from 'bootstrap';
import Navigo from 'navigo';

moment.locale('nl-be');
window.appSettings = {
    edit: {
        cost: null,
    }
};


const root = location.origin;
const useHash = true; // Defaults to: false
const hash = '#s'; // Defaults to: '#'
const router = new Navigo(root, useHash, hash);


const app = {
    async init() {
        app.listeners();
        ui.init();
        
        router.on('/:id', async (params) => {            
            shares.init(params);
        })
        .notFound(() => {
            user.init();
        })
        .resolve()
    },
    
    listeners() {
        document.addEventListener('change', (event) => {            
            if (ui.shareMode() != true) eventCallback('#form_step1', (target) => {
                target.classList.add('change--changed');
            }, false)
        })
        
        document.addEventListener('keyup', (event) => {
            eventCallback('[data-section="step2"] [data-form="newBudget"]', (target) => {
                const formData = extractFormData(target);                
                search.do({
                    container: node('[data-label="budgetsList"]'),
                    items: '.list__item',
                    query: formData.get('title')
                }, (container, found) => {
                    // console.log(found);
                    // console.log(container);
                    // if (found == false) templates.showError(container)
                    // if (found == true) templates.removeError(container)
                })
            }, false);
            
            eventCallback('[data-section="step3"] [data-form="newCost"]', (target) => {
                const formData = extractFormData(target);                
                search.do({
                    container: node('[data-label="costsList"]'),
                    items: '.list__item',
                    query: formData.get('title')
                }, (container, found) => {
                    // console.log(found);
                    // console.log(container);
                    // if (found == false) templates.showError(container)
                    // if (found == true) templates.removeError(container)
                })
            }, false)
        })
        
        document.addEventListener('click', (event) => { 
            clickEvent.set(event);
             
            eventCallback('logOut', () => {
                user.logOut();
            })
            
            eventCallback('[data-label="budgetsList"] [data-firebase].list__item', async (target) => {
                const budgetsData = await budget.get(target.dataset.firebase);
                window.appSettings.selectedBudget = budgetsData;
                render.costs();
                user.accessControl();             
            }, false)
            
            if (ui.shareMode() != true) eventCallback('[data-nav-section]', (target) => {
                target = target.dataset.navSection;
                
                templates.switch(target, () => {
                    if (target == 'budgetsListing') render.budgets();
                });
                ui.init();
                user.ui();
            }, false)
            
            if (ui.shareMode() != true || ui.readMode() != true) eventCallback('editCost', async (target) => {
                const parent = target.parentElement.closest('[data-firebase]');
                const id = window.appSettings.edit.cost = parent.dataset.firebase;
                
                const costData = await costs.get(id);
                const container = await parent.querySelector('[data-label="editCostForm"]');
                container.innerHTML = await render.costEditForm(costData);
                document.querySelector(`[data-firebase="${id}"] [name="type"] option[value="${costData.data.type}"]`).selected = true;
                document.querySelector(`[data-firebase="${id}"] [name="when"] option[value="${costData.data.when}"]`).selected = true;
            })
            
            if (ui.shareMode() != true || ui.readMode() != true) eventCallback('deleteCost', (target) => {
                const parent = target.parentElement.closest('[data-firebase]');
                const id = window.appSettings.edit.cost = parent.dataset.firebase;
                const budgetId = window.appSettings.selectedBudget.id;
                
                costs.delete(budgetId, id);
            })
        })
        
        document.addEventListener('submit', (event) => {
            event.preventDefault();
            // event.target.reset();
            
            eventCallback('[data-form="logIn"]', (target) => {
                const formData = extractFormData(target);                
                user.logIn({
                    email: formData.get('email'),
                    passw: formData.get('password')
                })
            }, false)
            
            eventCallback('#form_step1', (target) => {
                window.appSettings.group = extractFormData(event.target).get('group');
                render.budgets();
                user.accessControl();
            }, false);
            
            if (ui.readMode() != true) eventCallback('[data-form="newBudget"]' , (target) => {
                const formData = extractFormData(target)
                target.reset();
                
                budget.add({
                    tak: window.appSettings.group,
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    period: {
                        start: new Date(formData.get('period-start')),
                        end: new Date(formData.get('period-end'))
                    },
                    people: {
                        paying: 29,
                        free: 9
                    },
                    created: Date.now()
                })
            }, false);
            
            if (ui.shareMode() != true || ui.readMode() != true) eventCallback('[data-form="newCost"]', (target) => {
                const formData = extractFormData(target);
                target.reset();
                
                costs.add({
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    amount: formData.get('amount'),
                    type: formData.get('type'),
                    when: formData.get('when'),
                })
            }, false);
            
            eventCallback('[data-form="budgetShare"]', (target) => {
                const formData = extractFormData(target);
            
                shares.new({
                    validity: formData.get('date'),
                    target: window.appSettings.selectedBudget.id
                })
            }, false)
            
            eventCallback('[data-label="costsList"] .list__item form', (target) => {
                const formData = extractFormData(target);
                const listItem = target.parentNode.closest('[data-firebase]');
                costs.edit({
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    amount: formData.get('amount'),
                    type: formData.get('type'),
                    when: formData.get('when'),
                }, listItem.dataset.firebase, listItem);
            }, false)
        })
    },
}

app.init();

export {app};