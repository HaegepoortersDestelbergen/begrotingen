import {user} from './userControl';
import {app} from '../../index';
import {Element, node} from 'cutleryjs';
import { createToast, ui } from './uiControl';
import { db } from './plugins/firebase';

const admin = {
    async init(role) {
        if (role == 'admin') {
            ui.adminMode(true);
            await admin.listUsers();
            admin.selectFirstUser();
        } else {
            ui.adminMode(false);
        }
    },
    
    removeForUser() {
        const $nodes = node('[data-access="admin"]', true);
        $nodes.forEach(n => {
            n.remove();
        })
    },
    
    async listUsers() {
        const users = await user.getAll();
        
        users.forEach((u, index) => {
            if (index == 0) node('[data-access="adminPane"] [data-label="userList"]').innerHTML = '<ul></ul>'
            admin.renderUser(u, index);
        });
    },
    
    renderUser(userData, index) {
        const data = userData.data;
        const id = userData.id;
                    
        const item = new Element('li');
        item.class(['list__item', 'item']);
        item.inner(`
            <label class="d-flex">
                <input type="radio" value="${id}" name="admin-config-user">
                <div class="item__wrapper">
                    <div class="item__icon"><i class='bx bx-user-circle' ></i></div>
                    <div class="d-flex flex-column justify-content-center">
                        <span>${data.name}</span>
                    </div>
                </div>
            </label>
        `);
        item.append('[data-access="adminPane"] [data-label="userList"] ul');
    },
    
    selectFirstUser() {
        const $user = node('[data-access="adminPane"] [data-label="userList"] ul li input');
        const value = $user.value;
        $user.checked = true;
        admin.loadUserConfigForm(value);
    },
    
    async loadUserConfigForm(uid) {
        const response = await user.get(uid);
        const data = await response.data;
        admin.currentUser = await response;
        
        // check role
        const $role = node(`[data-form="userConfig"] input[value="${data.role}"]`);
        $role.checked = true;
        
        // load groups
        const table = '[data-form="userConfig"] [data-label="configGroups"] table';
        const $table = node(table);
        $table.innerHTML = `
            <tr class="form-label">
                <th>tak</th>
                <th colspan="2">rechten</th>
            </tr>
        `;
        
        // create table and check access groups
        const groups = app.config.groups;
        groups.forEach(g => {
            const access = data.access[g];
            
            const tr = new Element('tr');
            tr.inner(`
                <td>${g}</td>
                <td><label>
                        <input type="radio" name="${g}" value="none">
                        <span>none</span>
                    </label></td>
                <td><label>
                        <input type="radio" name="${g}" value="read">
                        <span>read</span>
                    </label></td>
                <td><label>
                        <input type="radio" name="${g}" value="write">
                        <span>write</span>
                </label></td>
            `);
            tr.append(table);
            
            const $input = node(`${table} input[name="${g}"][value="${access}"]`)
            $input.checked = true;
        })
    },
    
    async saveData(formData) {
        const userData = admin.currentUser.data;
        const userId = admin.currentUser.id;
        const groups = app.config.groups;
        
        // user role
        const role = formData.get('user-type');
        
        // access
        const access = {};
        groups.map(g => {;
            access[g] = formData.get(g);
        })
        
        userData.role = role;
        userData.access = access;
        
        try {
            await db.doc(`users/${userId}`).set(userData);
            createToast({
                title: 'Wijzigingen opgeslagen',
                content: 'Gebruiker werd aangepast'
            })
        } catch(err) {
           console.log(err) 
           createToast({
            title: 'Oeps',
            content: 'Gebruiker kon niet worden aangepast'
        })
        }
    }
}

export {
    admin
}