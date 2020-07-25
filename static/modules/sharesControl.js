import Navigo from 'navigo';
import {budget} from './dataControl'
import {switchTemplate, render, ui} from './uiControl'
import moment from 'moment';
import {db} from './plugins/firebase';
import {data} from './dataControl';
import { node } from './utils';

const root = location.origin;
const useHash = true; // Defaults to: false
const hash = '#s'; // Defaults to: '#'
const router = new Navigo(root, useHash, hash);

const shares = {
    init() {
        router.on('/:id', async (params) => {
            const shareData = await shares.getShareData(params.id);
            const valid = shares.valid(shareData);
            ui.shareMode(true);
            
            if (valid == true) shares.pass(shareData);
        })
        .resolve();
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
        const snapshot = await db.collection('shares').doc(id).get();
        const data = snapshot.data();
        return {
            id: id,
            data: data
        }
    },
    
    valid(shareData) {
        const now = moment();
        const validDate = moment(shareData.data.validity.seconds*1000);
        const diff = now.diff(validDate, 'days');
        
        if (diff > 0) {console.log('share not valid'); return false}
        else {console.log('share not valid'); return true}
    },
    
    async pass(shareData) {
        const budgetsData = await budget.get(shareData.data.target);
        
        window.appSettings.selectedBudget = {
            id: shareData.id,
            data: shareData.data
        };                            

        render.costs(budgetsData);
        ui.shareMode(true);
    }
}

export {shares}

