import {node, Element} from './utils'
import {getCollectionData} from './dataControl'
import moment from 'moment';
import 'moment/locale/nl-be';
import { Modal, Collapse } from 'bootstrap';

moment.locale('nl-be');

const render = {
    async budgets(tak) {
        const data = await getCollectionData(tak);
        data.forEach(doc => {
            const item = new Element('div');
            item.class(['list']);
            item.inner(`
                <div class="list__item item" data-firebase="${doc.id}">
                    <div class="item__icon">
                        <i class='bx bx-calendar-alt'></i>
                    </div>
                    <div class="item__body body">
                        <div class="body__prepend">
                            <span class="body__title">${doc.data.title}</span>
                            <small class="body__comment">Een beetje commentaar</small>
                        </div>
                        <div class="body__append">
                            <span>
                                ${moment.unix(doc.data.period.end.seconds).format('D MMM')}
                                tot 
                                ${moment.unix(doc.data.period.start.seconds).format('D MMM')}
                            </span>
                            <small>3436 euro</small>
                        </div>
                    </div>
                </div>
            `);
            item.append('[data-section="step2"] [data-label="budgetsList"]')
        })
        console.log(data)
    }
}

const ui = {
    generateCredits() {
        const projectData = require('../../package.json')
        node('#credits').innerHTML = `Versie ${projectData.version} — <a href="">Ondersteuning krijgen</a> — ontwikkeld door ${projectData.author}`
    }
}

Array.from(document.querySelectorAll('.modal')).forEach(bsNode => new Modal(bsNode))
Array.from(document.querySelectorAll('.collapse')).forEach(bsNode => {
    new Collapse(bsNode, {
        toggle: false
    });
})

export {
    render,
    ui,
}
