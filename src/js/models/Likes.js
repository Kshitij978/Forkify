export default class Likes {
    constructor() {
        this.likes = []; 
    }

    addLike(id, title, author, img) {
        const like = { id, title, author, img };
        this.likes.push(like);
        return like;
    }

    deleteLike(id) {
        const idx = this.likes.findIndex(el => el.id === id);
        this.likes.splice(idx, 1); //mutates the original array 
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }
}