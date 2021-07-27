import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
import Likes from './models/Likes';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Liked recipes
 */
const state = {};


/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
    // 1. Get query from the view
    const query = searchView.getInput(); //TODO

    if (query) {
        // 2. New search object and add it to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. Search for recipes
            await state.search.getResult();

            // 5. Render results on the UI.
            clearLoader();
            searchView.renderResults(state.search.result);

            //6. Set recipe ID to first result on search.
            window.location.hash = state.search.result[0].recipe_id;

        } catch (error) {
            clearLoader();
            controlRecipe();
            searchView.onSearchError();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);   
    }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // Get ID from url.
    const id = window.location.hash.replace('#', '');
    recipeView.placeholder();
    if(id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if(state.search) searchView.highlightSelect(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try{
            // Get recipe data and parse Ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            //console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        } catch (error) {
            alert('Error processing recipe!');
        }
       
    }
}

// window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/** 
 * LIST CONTROLLER
*/
const controlList = () => {
    //Create a list if there is none
    if (!state.list) state.list = new List();

    //Add each ing to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/** 
 * LIKE CONTROLLER
*/

const controlLike = () => {
    //Create new like if there is none
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    //User has NOT yet like the current recipe
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        );

        //Toggle Like button
        likesView.toggleLikeButton(true);

        //Add like to the UI
        likesView.renderLike(newLike);
    } else {
        //Remove like to the state
        state.likes.deleteLike(currentID);

        //Toggle like button
        likesView.toggleLikeButton(false);

        //Remove like from the UI
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle the button
    likesView.toggleLikeMenu(state.likes.getNumLikes());


    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        } else if (e.target.matches('.btn-increase, .btn-increase *')) {
            //Increase button is clicked
            state.recipe.updateServings('inc');
            recipeView.updateServingsIngredients(state.recipe);
        } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
            controlList();
        } else if (e.target.matches('.recipe__love, .recipe__love *')) {
            controlLike();
        }
});
 