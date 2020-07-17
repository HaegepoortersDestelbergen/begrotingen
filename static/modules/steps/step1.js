import {node, actionCallback} from '../utils'

export const step1 = {
    init() {
        this.cache();
        this.listeners();
    },
    
    cache() {

    },
    
    listeners() {
        node('form').addEventListener('change', (event) => {
            const form = event.target.closest('form');
            form.classList.add('change--changed');
        })
        
        // node('form').addEventListener('submit', (event) => {
        //     event.preventDefault();
        //     const option = event.target.querySelector('input:checked');
            
        //     const formData = new FormData(event.target)
        //     console.log(formData.get('group'));
        // })
    },
    
    routeSwitch(input) {
        
    }
}