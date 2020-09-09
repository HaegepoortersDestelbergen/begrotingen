import {auth} from './plugins/firebase';
import {ui, templates, render, createToast} from './uiControl';
import {data} from './dataControl';
import {node, formError, clickEvent} from './utils';

const user = {   
    async init() {        
        auth.onAuthStateChanged(async state => {
            if (state) {
                user.active = await this.getUserData(state.uid);
                
                templates.switch('groupSelect', () => {
                    user.ui(user.active.data.access);
                }, true);
            } else {
                templates.switch('userLogIn');
            }
        })
    },
    
    logIn({email, passw}) {
        createToast({
            title: 'Login',
            content: 'Je wordt aangemeld',
        })
        user.logInScreen(false);
        auth.signInWithEmailAndPassword(email, passw)
        .then(resp => {console.log(resp)})
        .catch(err => {
            if (err.code == 'auth/user-not-found') formError('Deze gebruiker werd niet gevonden');
            user.logInScreen(true);
        });
    },
    
    demoLogin() {
        // createToast({
        //     title: 'Demo login',
        //     content: 'Demo omgeving wordt ingeladen',
        // })
        user.logIn({
            email: 'demo@haegepoorters.be',
            passw: 'demo123'
        })
    },
    
    logOut() {
        createToast({
            title: 'Afmelden',
            content: 'Je wordt afgemeld',
        })
        auth.signOut();
    },
    
    checkForLogIn() {
        if (ui.shareMode() != true) templates.switch('groupSelect');
    },
    
    async getUserData(id) {
        const response = await data.getDoc('users', id);
        return response
    },
    
    async ui(accessData = null) {
        if (accessData == null) {accessData = user.active.data.access};
               
        const groups = ['kapoenen', 'welpen', 'woudlopers', 'jonggivers', 'givers', 'groepsleiding', 'demo'];
        groups.forEach(group => {
            const input = node(`#form_step1 input[value="${group}"]`).closest('.form__group');
            if (accessData[group] == 'none' && input) input.remove();
        })
    },
    
    accessControl() {
        const access = user.active ? user.active.data.access[window.appSettings.group] : 'none';
        
        if (access == 'none') console.log('prohibited access')
        if (access == 'read') ui.readMode(true);
        if (access == 'write') ui.readMode(false);
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