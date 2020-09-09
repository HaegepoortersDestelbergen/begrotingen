import {ui, templates, render, createToast, fadeOutNode} from './static/modules/uiControl';
import {budget, costs, extractFormData, data, search} from './static/modules/dataControl';
import {eventCallback, node, cookies, Element, connection} from 'cutleryjs';
import moment from 'moment';
import 'moment/locale/nl-be';
import {shares} from './static/modules/sharesControl';
import {user} from './static/modules/userControl';
import {clickEvent, updateClipboard} from './static/modules/utils';
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
        
        // createToast({
        //     title: 'App was loaded [no content]',
        //     timer: 100000
        // })
        
        // createToast({
        //     content: 'App was loaded [no title]',
        //     timer: 100000
        // })
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
            
            eventCallback('closeToast', (target) => {
                const toast = target.parentNode.closest('.toast');
                fadeOutNode(toast);
            })
            
            eventCallback('[data-clipboard]', (target) => {
                const content = target.dataset.clipboard;
                updateClipboard(content);
            }, false)
             
            eventCallback('logOut', () => {
                user.logOut();
            })
            
            eventCallback('[data-label="budgetsList"] [data-firebase].list__item', async (target) => {
                const budgetsData = await budget.get(target.dataset.firebase);
                window.appSettings.selectedBudget = budgetsData;
                await render.costs(window.appSettings.selectedBudget);
                user.accessControl();             
            }, false)
            
            eventCallback('[data-form="newCost"] button[type="reset"]', search.reset, false)
            
            eventCallback('demoLogin', user.demoLogin);
            
            eventCallback('deleteBudget', () => {
                budget.delete();
            });
            
            // if sharemode and readmode are disabled
            if (ui.shareMode() != true || ui.readMode() != true) {
                eventCallback('editCost', async (target) => {
                    const parent = target.parentElement.closest('[data-firebase]');
                    const id = window.appSettings.edit.cost = parent.dataset.firebase;
                    
                    const costData = await costs.get(id);
                    const container = await parent.querySelector('[data-label="editCostForm"]');
                    container.innerHTML = await render.costEditForm(costData);
                                    
                    document.querySelector(`[data-firebase="${id}"] [name="type"] option[value="${costData.data.type}"]`).selected = true;
                    document.querySelector(`[data-firebase="${id}"] [name="type"] option[value="${costData.data.type}"]`).selected = true;
                    document.querySelector(`[data-firebase="${id}"] [data-label="previewNewCostIcons"] [value="${costData.data.category || 'other'}"]`).checked = true;
                })
                
                eventCallback('deleteCost', (target) => {
                    const parent = target.parentElement.closest('[data-firebase]');
                    const id = window.appSettings.edit.cost = parent.dataset.firebase;
                    const budgetId = window.appSettings.selectedBudget.id;
                    
                    costs.delete(budgetId, id);
                })
            }
            
            // if sharemode only is disabled
            if (ui.shareMode() != true) {
                eventCallback('[data-nav-section]', (target) => {
                    target = target.dataset.navSection;
                    
                    templates.switch(target, () => {
                        if (target == 'budgetsListing') render.budgets();
                    });
                    ui.init();
                    user.ui();
                }, false)
            }
            
            eventCallback('[data-label="costsList"] .list__item [data-label="editCostForm"] button[type="reset"]', (target) => {
                const form = target.parentNode.closest('[data-label="editCostForm"]');
                form.innerHTML = '';
            }, false)
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
            
            if (ui.readMode() != true) eventCallback('[data-form="newBudget"]' , async (target) => {
                const formData = extractFormData(target)
                
                await budget.add({
                    tak: window.appSettings.group,
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    period: {
                        start: new Date(formData.get('period-start')),
                        end: new Date(formData.get('period-end'))
                    },
                    people: {
                        paying: formData.get('people-paying'),
                        free: formData.get('people-free')
                    },
                    created: Date.now()
                });
                
                target.reset();
                search.reset('[data-label="budgetsList"]');
            }, false);
            
            if (ui.shareMode() != true || ui.readMode() != true) eventCallback('[data-form="newCost"]', (target) => {
                const formData = extractFormData(target);
                
                // reset cost form & search ui
                target.reset();
                search.reset('[data-label="costsList"]');
                
                // add cost to firebase
                costs.add({
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    category: formData.get('category'),
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
                    category: formData.get('category'),
                    amount: formData.get('amount'),
                    type: formData.get('type'),
                    when: formData.get('when'),
                }, listItem.dataset.firebase, listItem);
            }, false)
            
            eventCallback('[data-form="editBudget"]', (target) => {
                const formData = extractFormData(target);
                const id = window.appSettings.selectedBudget.id;
                
                budget.edit({
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    period: {
                        start: new Date(formData.get('period-start')),
                        end: new Date(formData.get('period-end'))
                    },
                    people: {
                        paying: formData.get('people-paying'),
                        free: formData.get('people-free')
                    },
                }, id);
            }, false)
        })
        
        connection.watch((state) => {
            if (state == 3) window.appSettings.connectionState == state;
            if (state == 2 || state == 1 ) {
                window.appSettings.connectionState = state
                createToast({
                    title: 'Trage internetverbinding',
                    content: 'We detecteerden dat je een trage internetverbinding hebt. Zorg voor een betere verbinding zodat deze app beter werkt.',
                    timer: 10000
                })
            }
            if (state == 0) {
                window.appSettings.connectionState = state
                createToast({
                    title: 'Internetverbinding verbroken',
                    content: 'Doordat je geen verbinding hebt met het internet zal deze app niet goed functioneren.',
                    timer: 10000
                })
            }
            
            if (state == 3 && state > window.appSettings.connectionState) createToast({
                title: 'Internetverbinding optimaal',
                content: 'We detecteerden een verbeterde internetverbinding.',
                timer: 8000
            })
        })
    },
}

app.init();

export {app};