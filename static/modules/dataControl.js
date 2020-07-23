import {db} from './plugins/firebase';
import {render, contextSwitch} from './uiControl';

const budget = {
    async add({tak, title, comment, period, people}) {
        db.collection('takken').add({
            group: window.appSettings.group,
            title: title,
            comment: comment,
            period: period,
            people: people,
            created: (new Date).getTime() 
        })
        .then(async (response) => {
            const budgetData = await budget.get(response.id);
            render.budget({id: budgetData.id, data: budgetData.data}, true);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    },
    
    async get(id) {
        const snapshot = await db.collection('takken').doc(id).get();
        const data = snapshot.data();
        return {
            id: id,
            data: data
        };
    },
    
    async getAll() {
        const snapshot = await db.collection('takken').where('group', '==', window.appSettings.group).get();
        const data = snapshot.docs.map((querySnapshot) => {
            return {
                id: querySnapshot.id,
                data: querySnapshot.data()
            }
        })
        return data;
    }
}

const costs = {
    getCollection() {
        // return db.collection(window.appSettings.group).doc(window.appSettings.selectedBudget.id).collection('costs');
        return db.collection('takken').doc(window.appSettings.selectedBudget.id).collection('costs')
    },
    
    async add({title, comment, amount, type, when}) {
        costs.getCollection().add({
            title: title,
            comment: comment,
            amount: amount,
            type: type,
            when: when,
            created: new Date()
        })
        .then(async (response) => {
            const costData = await costs.getCollection().doc(response.id).get();
            render.cost({id: costData.id, data: costData.data()})
                  .prepend('[data-section="step3"] [data-label="costsList"]');
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    },
    
    async getAll() {
        const snapshot = await costs.getCollection().get();
        const data = snapshot.docs.map((querySnapshot) => {
            return {
                id: querySnapshot.id,
                data: querySnapshot.data()
            }
        })
        return data;
    },
    
    async get(id) {
        const snapshot = await costs.getCollection().doc(id).get();
        return {
            id: id,
            data: snapshot.data()
        };
    },
    
    async edit() {
        // replace current with new generated
    },
    
    calculateCost(price, when, costType) {
        const budgetData = window.appSettings.selectedBudget.data;
        
        switch (costType) {
            case 'fixed':
                return price*contextSwitch.whenCalculations(when)
                break;
            case 'per-person':
                return price*(budgetData.people.paying + budgetData.people.free)*contextSwitch.whenCalculations(when)
                break;
            case 'per-payer':
                return price*(budgetData.people.paying)*contextSwitch.whenCalculations(when)
                break;
            case 'per-free':
                return price*(budgetData.people.free)*contextSwitch.whenCalculations(when)
                break;
            case 'income':
                return price*contextSwitch.whenCalculations(when)
                break;
        
            default:
                break;
        }
    }
}

const loadTestData = async () => {
    const snapshot = await db.collection('kapoenen').get();
    return snapshot.docs.map(doc => doc.data());
}

const extractFormData = (formNode) => {
    // https://stackoverflow.com/a/14438954/9357283
    
    const names = new Set();
    const formData = new FormData(formNode);
    const returnData = new Map();
    const nameElements = formNode.querySelectorAll('[name]');
    
    nameElements.forEach(node => {
        names.add({
            name: node.getAttribute('name'),
            type: node.getAttribute('type') || 'textarea'
        });
    });
    
    names.forEach(i => {
        returnData.set(i.name, i.type == 'number' ? parseFloat(formData.get(i.name)) : formData.get(i.name))
    })
    
    return returnData;
}

export {
    budget,
    costs,
    loadTestData,
    extractFormData
}
