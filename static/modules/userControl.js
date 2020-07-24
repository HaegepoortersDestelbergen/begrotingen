import {auth} from './plugins/firebase';
import {ui, switchTemplate, render} from './uiControl';
import {data} from './dataControl';
import {node, formError, clickEvent} from './utils';

const user = {
    async init() {
        auth.onAuthStateChanged(async state => {
            if (state) {
                user.active = await this.getUserData(state.uid);
                
                switchTemplate.switch('groupSelect', () => {
                    user.ui(user.active.data.access);
                }, true);
            } else {
                switchTemplate.switch('userLogIn');
            }
        })
    },
    
    logIn({email, passw}) {
        user.logInScreen(false);
        auth.signInWithEmailAndPassword(email, passw)
        .then(resp => {console.log(resp)})
        .catch(err => {
            if (err.code == 'auth/user-not-found') formError('Deze gebruiker werd niet gevonden');
            user.logInScreen(true);
        });
    },
    
    logOut() {
        auth.signOut();
    },
    
    checkForLogIn() {
        if (ui.shareMode() != true) switchTemplate.switch('groupSelect');
    },
    
    async getUserData(id) {
        const response = await data.getDoc('users', id);
        return response
    },
    
    async ui(accessData = null) {
        if (accessData == null) {accessData = user.active.data.access};
               
        const groups = ['kapoenen', 'welpen', 'woudlopers', 'jonggivers', 'givers', 'groepsleiding'];
        groups.forEach(group => {
            const input = node(`#form_step1 input[value="${group}"]`);
            const label = node(`#form_step1 input[value="${group}"]+label`);
            if (accessData[group] == 'none' && input) {
                input.remove();
                label.remove();
            }
        })
    },
    
    accessControl() {
        switch (user.active.data.access[window.appSettings.group]) {
            case 'none':
                console.log('prohibited access')
                break;
            case 'read':
                render.budgets();
                switchTemplate.switch('budgetsListing', (context) => {
                    context.editContext('group', window.appSettings.group)
                });
                ui.readMode(true);
                break;
            case 'write':
                render.budgets();
                switchTemplate.switch('budgetsListing', (context) => {
                    context.editContext('group', window.appSettings.group)
                });
                break;
            
            default:
                break;
        }
    },
    
    logInScreen(bool = true) {
        const wrapper = node('[data-section="step0"] .login-wrapper');
        
        if (bool == false) {
            wrapper.classList.add('login-wrapper--validating');
            wrapper.classList.remove('login-wrapper--form');
        } else if (bool == true) {
            wrapper.classList.remove('login-wrapper--validating');
            wrapper.classList.add('login-wrapper--form');
        }
    }
}

export {
    user
}