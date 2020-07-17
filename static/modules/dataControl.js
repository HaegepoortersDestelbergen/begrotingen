import {db} from './plugins/firebase';
import {eventCallback} from './utils';

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

const getCollectionData = async (tak) => {
    const snapshot = await db.collection(tak).get();
    const data = snapshot.docs.map((querySnapshot) => {
        return {
            id: querySnapshot.id,
            data: querySnapshot.data()
        }
    })
    return data;
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
    addBudgetCost,
    addBudget,
    getCollectionData,
    loadTestData,
    extractFormData
}
