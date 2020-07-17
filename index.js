import {kap, wel, wol, jgv, giv} from './static/modules/svgs';
import {step1} from './static/modules/steps/step1';
import {ui, render} from './static/modules/uiControl';
import {eventCallback} from './static/modules/utils';
import {addBudget, extractFormData} from './static/modules/dataControl';
import moment from 'moment';

window.appSettings = {};

console.log(moment.now());

const app = {
    init() {
        app.listeners();
        app.svgReplacement();
        
        step1.listeners();
        
        ui.generateCredits();
        render.budgets('kapoenen');
    },
    
    listeners() {
        document.addEventListener('click', (event) => {    
            eventCallback('testing' , () => {
                console.log('click');
            })
        })
        
        document.addEventListener('submit', (event) => {
            event.preventDefault();
            
            eventCallback('#form_step1', () => {
                window.appSettings.group = extractFormData(event.target).get('group');
                console.log('Selected group:', window.appSettings.group);
            }, false);
            
            eventCallback('[data-form="newBudget"]' , () => {
                const formData = extractFormData(event.target)
                
                addBudget({
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

app.init();