import uniqid from 'uniqid'

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const idx = this.items.findIndex(el => el.id === id);
        this.items.splice(idx, 1); //mutates the original array 
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}