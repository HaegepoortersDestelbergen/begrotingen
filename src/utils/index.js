export const env = (dev = '', prod = '') => {
    const env = process.env.NODE_ENV;
    return env === 'development' ? dev : prod;
}

export const getToken = () => {
    return JSON.parse(window.localStorage.getItem('user')) || { token: null, userId: null };
}

export const localToken = () => JSON.parse(window.localStorage.getItem('user')) || null;

Number.prototype.pricify = function (append = 'euro', fixed = 2) {
    return `${this.toFixed(fixed).replace('.', ',')} ${append}`
}

export const logOut = () => {
    window.localStorage.removeItem('user');
    window.location.hash = '#/login';
}

export const _cls = (...classes) => classes.filter(c => c != false).join(' ');

export { QUERIES, SUBS } from './queries';
// export {
//     env,
//     getToken,
//     localToken,
//     logOut
// }