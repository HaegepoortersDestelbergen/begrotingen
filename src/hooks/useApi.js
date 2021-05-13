import React, { useEffect, useReducer } from 'react';
import reducer, { initialState } from '../utils/reducer';

const useApi = (url, isLazy = true) => {
    if (!url) throw new Error('No url defined');
    const [ state, dispatch ] = useReducer(reducer, initialState);
    
    const handleRequest = async ({ method, body } = { method: 'GET', body: {} }) => {
        try {
            dispatch({ type: 'loading' });
            const res = await fetch(url, {
                method,
                body: method === 'GET' ? null : JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const apiData = await res.json();
            dispatch({ type: 'success', payload: await apiData });
        } catch (err) {
            dispatch({ type: 'error', payload: err })
        }
    }
    
    useEffect(() => {
        if (!isLazy) handleRequest();
    }, [])
    
    return {
        ...state,
        submit: handleRequest
    }
}

export default useApi;