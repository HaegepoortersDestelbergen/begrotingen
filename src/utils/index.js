const env = (dev = '', prod = '') => {
    const env = process.env.NODE_ENV;
    return env === 'development' ? dev : prod;
}

const getToken = () => {
    return JSON.parse(window.localStorage.getItem('user')) || { token: null, userId: null };
}

export {
    env,
    getToken
}