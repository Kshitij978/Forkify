export default class Likes {
    constructor() {
        this.likes = []; 
    }

    addLike(id, title, author, img) {
        const like = { id, title, author, img };
        this.likes.push(like);

        // Persist data in local storage
        this.persistData();
        return like;
    }

    deleteLike(id) {
        const idx = this.likes.findIndex(el => el.id === id);
        this.likes.splice(idx, 1); //mutates the original array 

        // Persist data in local storage
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));

        //Restore likes from the localStorage
        if (storage) this.likes = storage;
    }
}