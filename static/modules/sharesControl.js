import {budget} from './dataControl'
import {templates, render, ui} from './uiControl'
import moment from 'moment';
import {db} from './plugins/firebase';
import {data} from './dataControl';
import { node } from './utils';

// https://console.firebase.google.com/u/3/project/begrotingen-haegepoorters/firestore/data~2Fshares

const shares = {
    async init(params) {     
        shares.watchForElements();
        
        const shareData = await shares.getShareData(params.id);
        const valid = shares.valid(shareData);
        if (valid == true) shares.pass(shareData);
    },
    
    watchForElements() {
        const elementToObserve = node('body');
        const observer = new MutationObserver(() => {
            ui.shareMode(true);
        });
        observer.observe(elementToObserve, {subtree: true, childList: true});
    },
    
    async new(formData) {
        const id = await data.createDoc('shares', {
            validity: formData.validity,
            target: formData.target,
        })
        await node('[data-form="budgetShare"]').classList.add('d-none');
        await node('[data-label="linkPreview"]').classList.add('d-block');
        node('[data-label="linkPreview"] input').value = `${window.location.origin}/#s/${id}`;
    },
    
    async getShareData(id) {
        const snapshot = db.collection('shares').doc(id);
        const data = await snapshot.get();
        return {
            id: id,
            data: data.data()
        }
    },
    
    valid(shareData) {
        const now = moment();
        const validDate = moment(shareData.data.validity);
        const diff = now.diff(validDate, 'days');
        
        if (diff > 0) {console.log('share not valid'); return false}
        else {console.log('share valid'); return true}
    },
    
    async pass(shareData) {
        const budgetsData = await budget.get(shareData.data.target);
        window.appSettings.selectedBudget = budgetsData;

        await render.costs(budgetsData);
    }
}

export {shares}

