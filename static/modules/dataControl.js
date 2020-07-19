import {db} from './plugins/firebase';

const addBudgetCost = ({tak, title, comment, period, people}) => {
    db.collection(tak).set({
        title: title,
        comment: comment,
        period: period,
        costs: null,
        people: people,
        created: db.ServerValue.TIMESTAMP 
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

const addBudget = ({tak, title, comment, period, people}) => {
    db.collection(tak).add({
        title: title,
        comment: comment,
        period: period,
        people: people,
        created: (new Date).getTime() 
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

const budget = {
    async add({tak, title, comment, period, people}) {
        db.collection(tak).add({
            title: title,
            comment: comment,
            period: period,
            people: people,
            created: (new Date).getTime() 
        })
        .then(() => {
            console.log("Document successfully written!");
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
    async getAll() {
        const snapshot = await db.collection(window.appSettings.group).doc(window.appSettings.selectedBudget.id).collection('costs').get();
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
