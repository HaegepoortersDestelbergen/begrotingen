import moment from 'moment';

const node = (selector, multiple = false) => {
    if (multiple == false) return document.querySelector(selector);
    return document.querySelectorAll(selector);
}

const eventCallback = (selector, callback, action = true) => {
    let target = null;
    
    if (action == true) target = event.target.closest(`[data-action="${selector}"]`);
    else target = event.target.closest(selector);
    
    if (target) callback(target);
}

class Element {
    constructor(tagname) {
        if (typeof tagname != 'string') throw new Error('The tagname of this new element is not of the type string')
        try {this.el = document.createElement(tagname);}
        catch (err) {
            console.error('Something went wrong when creating a new element. We logged the error message for you convenience:');
            console.log(err);
        }
    }
    
    class(array) {
        if (typeof array != 'object') throw new Error('You should use an array for adding classes to an element')
        try {array.map(i => this.el.classList.add(i))}
        catch (err) {
            console.error('Something went wrong when adding classes. We logged this element and the error message for you convenience:');
            console.log(err);
            console.log(this.el);
        }
    }
    
    attributes(array) {
        if (typeof array != 'object') throw new Error('You should use an array for adding attributes to an element')
        try {array.map(i => this.el.setAttribute(i[0], i[1]))}
        catch (err) {
            console.error('Something went wrong when adding attribtues. We logged this element and the error message for you convenience:');
            console.log(err);
            console.log(this.el);
        }
    }
    
    inner(input) {
        this.el.innerHTML = input;
    }
    
    log() {
        console.log(this.el);
    }
    
    append(node = 'html body', type = 'selector') {
        if (typeof node == 'string') node = document.querySelector(node)
        else if (typeof node == 'object') node = node
        
        try {node.appendChild(this.el);}
        catch (err) {
            console.error('Something went wrong when adding an element. You\'ve probably entered a wrong selector or node element. We logged this element and the error message for you convenience:');
            console.log(err);
            console.log(this.el);
        }
    }
    
    return() {
        return this.el;
    }
}

const pricify = (price) => {
    return `${price.toFixed(2).toString().replace('.', ',')} euro`;
}

const periodDifference = (start, end) => {
    const dateStart = new Date(start);
    const dateEnd = new Date(end);
    
    const timeDiff = dateStart.getTime() - dateEnd.getTime();
    const diff = (timeDiff / (3600 * 24));
    
    return {
        days: diff < 0 ? (diff*-1)+1 : diff+1,
        nights: diff < 0 ? diff*-1 : diff,
    };
}


export {
    node,
    eventCallback,
    Element,
    pricify,
    periodDifference
}