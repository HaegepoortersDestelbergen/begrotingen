import {db} from './plugins/firebase';
import {render, contextSwitch, templates} from './uiControl';
import {Element} from 'cutleryjs';

const data = {
    async getByPath(path) {
        const snapshot = db.collection(path).get();
        const data = snapshot.docs.map((querySnapshot) => {
            return {
                id: querySnapshot.id,
                data: querySnapshot.data()
            }
        })
        return data;
    },
    
    async getCollection(name) {
        const snapshot = await db.collection(name).get();
        const data = snapshot.data();
        return {
            id: id,
            data: data
        };
    },
    
    async getDoc(path, id) {
        const snapshot = await db.collection(path).doc(id).get();
        const data = snapshot.data();
        return {
            id: id,
            data: data
        };
    },
    
    async createDoc(path, data) {
        const response = await db.collection(path).add(data);
        console.log(response.id);
        return response.id;
    }
}

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
    },
    
    total: new Map(),
    addCost(doc) {       
        const has = budget.total.has(doc.id);
        if (has == false) budget.total.set(doc.id, doc.cost)
        else {
            budget.total.delete(doc.id);
            budget.total.set(doc.id, doc.cost);
        }
        
        return budget.returnTotal();
    },
    
    removeCost(id) {
        const has = budget.total.has(id);
        if (has == true) budget.total.delete(id);
        return budget.returnTotal();
    },

    returnTotal() {
        let totalBudget = 0;
        budget.total.forEach(cost => {totalBudget += cost});
        return totalBudget;
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
            console.log(response.id);
            // const costData = await costs.getCollection().doc(response.id).get();
            render.cost({id: response.id, data: {title, comment, amount, type, when}})
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
    
    async edit({title, comment, amount, type, when}, id, listItem) {
        costs.getCollection().doc(id).update({
            title: title,
            comment: comment,
            amount: amount,
            type: type,
            when: when,
            edited: new Date()
        }).then(() => {
            const updatedListItem = render.cost({id: id, data: {title, comment, amount, type, when}}).el;
            updatedListItem.classList.add('animate__fadeIn');
            
            listItem.classList.add('animate__fadeOut');
            listItem.outerHTML = updatedListItem.outerHTML;
        }).catch(err => {
            console.log(err);
        })
        
        // replace current with new generated
    },
    
    async delete(budget, id) {
        await db.doc(`takken/${budget}/costs/${id}`).delete();
        render.deleteCost(id);
    },
    
    calculateCost(price, when, costType) {
        const budgetData = window.appSettings.selectedBudget.data;
        let cost = null
        
        switch (costType) {
            case 'fixed':
                cost = price*contextSwitch.whenCalculations(when)
                break;
            case 'per-person':
                cost = price*(budgetData.people.paying + budgetData.people.free)*contextSwitch.whenCalculations(when)
                break;
            case 'per-payer':
                cost = price*(budgetData.people.paying)*contextSwitch.whenCalculations(when)
                break;
            case 'per-free':
                cost = price*(budgetData.people.free)*contextSwitch.whenCalculations(when)
                break;
            case 'income':
                cost = price*contextSwitch.whenCalculations(when)
                break;
        
            default:
                break;
        }
        return cost
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

const search = {
    do({container, items, query}) {
        search.container = container;
        if (typeof container == 'string') search.container = node(container);
        const listItems = search.container.querySelectorAll(items);
        
        query = query.toLowerCase();
        
        listItems.forEach(item => {
            const check = item.innerText.toLowerCase().includes(query);
            if (check == true) search.show(item);
            else if (check == false) search.hide(item);
        })
        
        const resultCount = search.container.querySelectorAll(`${items}:not(.animate__fadeOut)`).length;
        if (resultCount == 0) {
            search.notFound();
        } else {
            search.notFound(false);
        }
    },
    
    notFound(bool = true) {        
        const illustration = templates.return('listItemNotFound');
        const notFound = search.container.querySelector('.list__not-found');
        
        if (bool == true && notFound == null) search.container.append(illustration);
        else if (bool == false && notFound) notFound.remove();
    },
    
    hide(node) {
        if (node.classList.contains('animate__fadeOut') == false) {
            node.classList.remove('animate__fadeIn');
            node.classList.add('animate__fadeOut');
        }
    },
    
    show(node) {
        if (node.classList.contains('animate__fadeOut') == true) {
            node.classList.add('animate__fadeIn');
            node.classList.remove('animate__fadeOut');
        }
    }
}

// const cloudinaryUpload

export {
    data,
    budget,
    costs,
    search,
    loadTestData,
    extractFormData
}
