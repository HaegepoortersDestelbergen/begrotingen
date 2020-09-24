import {auth, db} from './plugins/firebase';
import {ui, templates, render, createToast} from './uiControl';
import {data, search} from './dataControl';
import {formError} from './utils';
import {node} from 'cutleryjs';
import {app, router} from '../../index'
import { admin } from './adminPane';

const user = {   
    init() {     
        return new Promise((succes, reject) => {
            auth.onAuthStateChanged(async state => {
                if (state) {                
                    user.active = await this.getUserData(state.uid);
                    const role = await user.active.data.role;
                    succes(role);
                    
                    admin.init(role);
                    router.navigate(`/takken`);
                    user.ui(user.active.data.access);
                }
                
                if (!state) {    
                    succes(null);            
                    templates.switch('userLogIn');
                    admin.init();
                }
            });
        })    
    },
    
    async get(id) {
        const snapshot = await db.doc(`users/${id}`).get();
        return {
            id: snapshot.id,
            data: snapshot.data()
        };
    },
    
    async getAll() {
        const snapshot = await db.collection('users').get();
        const data = snapshot.docs.map((querySnapshot) => {
            return {
                id: querySnapshot.id,
                data: querySnapshot.data()
            }
        })
        return data;
    },
    
    async add({email, password, name}) {        
        try {
            const response = await auth.createUserWithEmailAndPassword(email, password);
            const id = await response.user.uid;
            await db.collection('users').doc(id).set({
                name: name,
                role: 'user',
                access: {
                    kapoenen: 'none',
                    welpen: 'none',
                    woudlopers: 'none',
                    jonggivers: 'none',
                    givers: 'none',
                    groepsleiding: 'none',
                    demo: 'none'
                }
            })
            createToast({
                title: 'Nieuwe gebruiker',
                content: 'Gebruiker werd aangemaakt en aangemeld'
            })
        } catch (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)
            
            createToast({
                title: 'Oeps',
                content: 'Gebruiker kon niet worden aangemaakt'
            })
        }
        
        // .then((resp) => {
        //     console.log(resp.user.uid);
        //     // data.createDoc(`takken`)
        // })
        // .catch((error) => {
        //     // Handle Errors here.
        //     
        // });
    },
    
    async delete({id}) {
        if (!id) throw createToast({
            title: 'Gebruiker verwijderen',
            content: 'User Id niet gedefinieerd'
        })
        
        try {
            const response = await db.collection('users').doc(id).delete()
            console.log(response);
            
            createToast({
                title: 'Gebruiker verwijderen',
                content: 'Gebruiker werd verwijderd'
            })
        } catch (error) {
            console.log(error)
            
            createToast({
                title: 'Oeps',
                content: 'Gebruiker kon niet worden verwijderd'
            })
        }
        // admin.auth().deleteUser(id)
        // .then(function() {
        //     console.log('Successfully deleted user');
        // })
        // .catch(function(error) {
        //     console.log('Error deleting user:', error);
        // });
    },
    
    logIn({email, passw}) {
        createToast({
            title: 'Login',
            content: 'Je wordt aangemeld',
        })
        user.logInScreen(false);
        auth.signInWithEmailAndPassword(email, passw)
        .then(resp => {
            router.navigate('/takken');
            user.ui(user.active.data.access);
        })
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
        user.active = undefined;
        // router.navigate('')
        // templates.switch('userLogIn');
        // admin.init();
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
        if (accessData == null) {accessData = user.active?.data.access};
               
        const groups = app.config.groups;
        groups.forEach(group => {
            const $group = node(`#form_step1 input[value="${group}"]`);
            if (accessData[group] == 'none' && $group) $group.closest('.form__group').remove();
        })
    },
    
    accessControl(access = null) {
        if (access == null) access = user.active ? user.active.data.access[window.appSettings.group] : 'none';
        const shareMode = ui.modes.share;
        
        if (access == undefined) router.navigate('');
        if (access == 'none' && shareMode == false) router.navigate('');
        if (access == 'read' || access == 'share') ui.readMode(true);
        if (access == 'write') ui.readMode(false);
        
        // router.on('/budgets/:id', () => {
        //     console.log('access budgets');
        //     const rights = user.rights4Group(access);
        //     console.log(rights);
        // })
        
        return access;
    },
    
    rights4Group(group = window.appSettings.group) {
        return user.active.data.access[group];
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
    },
        
    getRole() {
        if (user.active) return user.active.data.role;
    },

    setRoleForm(role) {
        const $form = node(`[data-form="userRole"]`)
        if (role && $form) {
            const $input = node(`[data-form="userRole"] input[value="${role}"]`);
            $input.checked = true;
        }
    }
}

const roles = {
    user: {
        settings: false,
        config: false
    },
    poweruser: {
        settings: true,
        config: false
    },
    admin: {
        settings: true,
        config: true
    }
}

const domAccess = {
    async init() {
        user.getRole();
        domAccess.setRolesRights();
        
        // get role rights from server for user
        // check for each if user is cleared
        // remove nodes if needed
        // set usertype global
    },
    
    getNodes() {
        const searchFor = [
            'adminBar', 
            'appSettings'
        ];
        
        return searchFor.map(n => {
            return node(`[data-access="${n}"]`)
        })
    },
    
    generateRightsForm() {
        const $form = node('[data-form="userRights"]');
        const $rightsList = node('[data-form="userRights"] [data-label="rightsList"]');
        const $nodes = domAccess.getNodes();
        $nodes.forEach((n) => {
            const name = n.dataset.access;
            const tempStr = `
                <label class="d-block">
                    <span class="form-label">${name}</span>
                    <input type="checkbox" name="${name}">
                </label>
            `;
            $rightsList.innerHTML += tempStr;
        })
    },
    
    async setRolesRights(data) {
        try {
            await db.doc('settings/roles').set({
                user: {
                    settings: false,
                    config: false
                },
                poweruser: {
                    settings: true,
                    config: false
                },
                admin: {
                    settings: true,
                    config: true
                }
            })
        } catch(err) {
           console.log(err) 
        }
    }
}

export {
    user,
    domAccess
}