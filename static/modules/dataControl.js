import {db} from './plugins/firebase';
import {render} from './uiControl';

const budget = {
    async add({tak, title, comment, period, people}) {
        db.collection(tak).add({
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
        const snapshot = await db.collection(window.appSettings.group).doc(id).get();
        const data = snapshot.data();
        return {
            id: id,
            data: data
        };
    },
    
    async getAll(tak) {
        const snapshot = await db.collection(tak).get();
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
        return db.collection(window.appSettings.group).doc(window.appSettings.selectedBudget.id).collection('costs');
    },
    
    async add() {
        costs.getCollection({title, comment, amount, type}).add({
            title: title,
            comment: comment,
            amount: amount,
            type: period,
            created: new Date()
        })
        .then(async (response) => {
            const costData = await getCollection().get(response.id);
            render.cost({id: costData.id, data: costData.data}, true);
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
        names.add(node.getAttribute('name'));
    });
    
    names.forEach(name => {
        returnData.set(name, formData.get(name))
    })
    
    return returnData;
}

export {
    budget,
    costs,
    loadTestData,
    extractFormData
}
