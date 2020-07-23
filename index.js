import {ui, switchTemplate, render} from './static/modules/uiControl';
import {pricify} from './static/modules/utils';
import {budget, costs, extractFormData} from './static/modules/dataControl';
import {eventCallback, node} from 'cutleryjs';
import moment from 'moment';
import 'moment/locale/nl-be';
import {shares} from './static/modules/sharesControl'

moment.locale('nl-be');
window.appSettings = {
    edit: {
        cost: null,
    }
};


const app = {
    init() {
        app.listeners();
        switchTemplate.switch('groupSelect');
        ui.init();
        shares.init();
    },
    
    listeners() {
        document.addEventListener('change', (event) => {            
            if (ui.shareMode() != true) eventCallback('#form_step1', (target) => {
                target.classList.add('change--changed');
            }, false)
        })
        
        document.addEventListener('click', (event) => {                          
            eventCallback('[data-label="budgetsList"] [data-firebase].list__item', async (target) => {
                const budgetsData = await budget.get(target.dataset.firebase);
                window.appSettings.selectedBudget = budgetsData;
                                
                switchTemplate.switch('costsListing', (context) => {
                    context.editContext('title', budgetsData.data.title);
                    context.editContext('meta', `
                        ${moment.unix(budgetsData.data.period.start.seconds).format('D MMM')} tot ${moment.unix(budgetsData.data.period.end.seconds).format('D MMM')}
                        – ${budgetsData.data.people.paying + budgetsData.data.people.free} personen
                    `);
                    context.editContext('comments', budgetsData.data.comment);
                });
                render.costs();
            }, false)
            
            if (ui.shareMode() != true) eventCallback('[data-nav-section]', (target) => {
                target = target.dataset.navSection;
                
                switchTemplate.switch(target, () => {
                    if (target == 'budgetsListing') render.budgets();
                });
                ui.init();
            }, false)
            
            if (ui.shareMode() != true) eventCallback('editCost', async (target) => {
                const parent = target.parentElement.closest('[data-firebase]');
                const id = window.appSettings.edit.cost = parent.dataset.firebase;
                
                const costData = await costs.get(id);
                const container = await parent.querySelector('[data-label="editCostForm"]');
                container.innerHTML = await render.costEditForm(costData);
                console.log(costData);
                document.querySelector(`[data-firebase="${id}"] [name="type"] option[value="${costData.data.type}"]`).selected = true;
                document.querySelector(`[data-firebase="${id}"] [name="when"] option[value="${costData.data.when}"]`).selected = true;
            })
        })
        
        document.addEventListener('submit', (event) => {
            event.preventDefault();
            
            eventCallback('#form_step1', () => {
                window.appSettings.group = extractFormData(event.target).get('group');
                console.log('Selected group:', window.appSettings.group);
                
                render.budgets();
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
            
            if (ui.shareMode() == false) eventCallback('[data-form="newCost"]', (target) => {
                const formData = extractFormData(target);
                
                costs.add({
                    title: formData.get('title'),
                    comment: formData.get('comments'),
                    amount: formData.get('amount'),
                    type: formData.get('type'),
                    when: formData.get('when'),
                })
            }, false)
        })
    }
}

app.init();

export {app};