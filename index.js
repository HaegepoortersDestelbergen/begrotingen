import {ui, render} from './static/modules/uiControl';
import {pricify} from './static/modules/utils';
import {budget, costs, extractFormData} from './static/modules/dataControl';
import {eventCallback, node} from 'cutleryjs';

window.appSettings = {};

const app = {
    init() {
        app.listeners();
        
        ui.switch('groupSelect');
        ui.init();
    },
    
    listeners() {
        document.addEventListener('change', (event) => {
            console.log('click: change');
            
            eventCallback('#form_step1', (target) => {
                target.classList.add('change--changed');
            }, false)
        })
        
        document.addEventListener('click', (event) => {  
            console.log('event: click');  
                        
            eventCallback('testing' , () => {
                console.log('click');
            })
            
            eventCallback('[data-label="budgetsList"] [data-firebase].list__item', async (target) => {
                const budgetsData = await budget.get(target.dataset.firebase);
                window.appSettings.selectedBudget = budgetsData;
                
                ui.switch('costsListing');
                render.costs();
            }, false)
            
            eventCallback('[data-nav-section]', (target) => {
                target = target.dataset.navSection;
                
                ui.switch(target, () => {
                    if (target == 'budgetsListing') render.budgets(window.appSettings.group);
                });
                ui.init();
            }, false)
        })
        
        document.addEventListener('submit', (event) => {
            console.log('event: submit');
            event.preventDefault();
            
            eventCallback('#form_step1', (target) => {
                window.appSettings.group = extractFormData(event.target).get('group');
                console.log('Selected group:', window.appSettings.group);
                
                render.budgets(window.appSettings.group);
                ui.switch('budgetsListing');
            }, false);
            
            eventCallback('[data-form="newBudget"]' , () => {
                const formData = extractFormData(event.target)
                
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
        })
    }
}

app.init();

export {app};