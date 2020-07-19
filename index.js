import {ui, switchTemplate, render} from './static/modules/uiControl';
import {pricify} from './static/modules/utils';
import {budget, costs, extractFormData} from './static/modules/dataControl';
import {eventCallback, node} from 'cutleryjs';
import moment from 'moment';
import 'moment/locale/nl-be';

moment.locale('nl-be');
window.appSettings = {};

const app = {
    init() {
        app.listeners();
        
        switchTemplate.switch('groupSelect');
        
        ui.init();
    },
    
    listeners() {
        document.addEventListener('change', (event) => {            
            eventCallback('#form_step1', (target) => {
                target.classList.add('change--changed');
            }, false)
        })
        
        document.addEventListener('click', (event) => {                          
            eventCallback('testing' , () => {
                console.log('click');
            })
            
            eventCallback('[data-label="budgetsList"] [data-firebase].list__item', async (target) => {
                const budgetsData = await budget.get(target.dataset.firebase);
                window.appSettings.selectedBudget = budgetsData;
                console.log(budgetsData)
                
                switchTemplate.switch('costsListing', (context) => {
                    context.editContext('title', 'Midweek');
                    context.editContext('meta', `
                        ${moment.unix(budgetsData.data.period.start.seconds).format('D MMM')} tot ${moment.unix(budgetsData.data.period.end.seconds).format('D MMM')}
                        – ${budgetsData.data.people.paying + budgetsData.data.people.free} personen
                    `);
                    context.editContext('comments', budgetsData.data.comment);
                });
                render.costs();
            }, false)
            
            eventCallback('[data-nav-section]', (target) => {
                target = target.dataset.navSection;
                
                switchTemplate.switch(target, () => {
                    if (target == 'budgetsListing') render.budgets(window.appSettings.group);
                });
                ui.init();
            }, false)
        })
        
        document.addEventListener('submit', (event) => {
            event.preventDefault();
            
            eventCallback('#form_step1', () => {
                window.appSettings.group = extractFormData(event.target).get('group');
                console.log('Selected group:', window.appSettings.group);
                
                render.budgets(window.appSettings.group);
                switchTemplate.switch('budgetsListing');
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
            
            eventCallback('[data-form="newCost"]', (target) => {
                const formData = extractFormData(target);
                console.log(formData);
                
                costs.add({
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    amount: formData.get('amount'),
                    type: formData.get('type'),
                })
                console.log(formData);
            }, false)
        })
    }
}

app.init();

export {app};