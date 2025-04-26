const SUPABASE_URL = 'https://skaoqugxznuvwxeeubbj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYW9xdWd4em51dnd4ZWV1YmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njg3ODIsImV4cCI6MjA2MTI0NDc4Mn0.GU0ZCz-g2ghjbHmUXTW22NO_BjgA_6-3xedc-r3dMmA';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authContainer = document.getElementById('auth');
const appContainer = document.getElementById('app');
const authMessage = document.getElementById('authMessage');

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        // User is logged in
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        loadRecipes(); // Load recipes for the logged-in user
    } else {
        // User is logged out
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        document.getElementById('recipeList').innerHTML = ''; // Clear recipes
    }
});

async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });
    if (error) {
        authMessage.textContent = 'Error signing up: ' + error.message;
    } else {
        authMessage.textContent = 'Sign up successful. Please check your email to confirm.';
    }
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });
    if (error) {
        authMessage.textContent = 'Error signing in: ' + error.message;
    } else {
        authMessage.textContent = 'Signed in successfully.';
    }
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error signing out:', error.message);
    } else {
        console.log('Signed out successfully.');
    }
}


async function loadRecipes() {
    const user = supabaseClient.auth.getUser(); // Get the current user
     if (!user) {
        return; // Don't load recipes if no user is logged in
    }

    const { data, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('user_id', (await user).data.user.id); // Filter recipes by user ID

    if (error) {
        console.error('Error fetching recipes:', error);
        return;
    }

    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = ''; // Clear existing recipes

    data.forEach(recipe => {
        displayRecipe(recipe);
    });
    if (data.length === 0) {
        addRecipe();
    }
}

function displayRecipe(recipe) {
    const recipeList = document.getElementById('recipeList');
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';
    recipeDiv.dataset.recipeId = recipe.id; // Store recipe ID

    let ingredientsHTML = '';
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
            ingredientsHTML += `
                <tr>
                    <td><input type="text" placeholder="Ingredient Name" value="${ingredient.name}"></td>
                    <td><input type="number" value="${ingredient.quantity}" min="0" step="any" onchange="calculateRow(this)"></td>
                    <td>
                        <select>
                            <option value="kg" ${ingredient.unit === 'kg' ? 'selected' : ''}>kg</option>
                            <option value="g" ${ingredient.unit === 'g' ? 'selected' : ''}>g</option>
                            <option value="l" ${ingredient.unit === 'l' ? 'selected' : ''}>l</option>
                            <option value="ml" ${ingredient.unit === 'ml' ? 'selected' : ''}>ml</option>
                            <option value="unit" ${ingredient.unit === 'unit' ? 'selected' : ''}>unit</option>
                        </select>
                    </td>
                    <td><input type="number" value="${ingredient.pricePerUnit}" min="0" step="any" onchange="calculateRow(this)"></td>
                    <td>AED <span>${(ingredient.quantity * ingredient.pricePerUnit).toFixed(2)}</span></td>
                    <td><button class="remove-btn" onclick="removeIngredient(this)">Remove</button></td>
                </tr>
            `;
        });
    }

    recipeDiv.innerHTML = `
        <h2 contenteditable="true">${recipe.name}</h2>
        <table>
            <thead>
                <tr>
                    <th>Ingredient</th>
                    <th>Quantity Needed</th>
                    <th>Unit</th>
                    <th>Price per Unit (AED)</th>
                    <th>Cost for Recipe (AED)</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${ingredientsHTML}
            </tbody>
        </table>
        <button onclick="addIngredient(this)">Add Ingredient</button>
        <div>
            <label>Total Servings:</label>
            <input type="number" value="${recipe.servings}" min="1" onchange="calculateTotal(this)">
            <p>Total Cost: AED <span class="totalCost">${recipe.total_cost.toFixed(2)}</span></p>
            <p>Cost per Serving: AED <span class="costPerServing">${recipe.cost_per_serving.toFixed(2)}</span></p>
            <label>Selling Price per Serving (AED):</label>
            <input type="number" value="${recipe.selling_price_per_serving}" min="0" onchange="calculateProfit(this)">
            <p>Estimated Profit per Serving: AED <span class="profitPerServing">${recipe.profit_per_serving.toFixed(2)}</span></p>
        </div>
        <button class="save-btn" onclick="saveRecipe(this)">Save Recipe</button>
        <button class="remove-btn" onclick="removeRecipe(this)">Remove Recipe</button>
    `;
    recipeList.appendChild(recipeDiv);
}

async function saveRecipe(button) {
    const recipeDiv = button.parentNode;
    const recipeId = recipeDiv.dataset.recipeId;
    const name = recipeDiv.querySelector('h2').textContent;
    const servings = parseInt(recipeDiv.querySelector('input[onchange="calculateTotal(this)"]').value);
    const total_cost = parseFloat(recipeDiv.querySelector('.totalCost').textContent);
    const cost_per_serving = parseFloat(recipeDiv.querySelector('.costPerServing').textContent);
    const selling_price_per_serving = parseFloat(recipeDiv.querySelector('input[onchange="calculateProfit(this)"]').value);
    const profit_per_serving = parseFloat(recipeDiv.querySelector('.profitPerServing').textContent);

    const ingredients = [];
    recipeDiv.querySelectorAll('tbody tr').forEach(row => {
        ingredients.push({
            name: row.cells[0].querySelector('input').value,
            quantity: parseFloat(row.cells[1].querySelector('input').value),
            unit: row.cells[2].querySelector('select').value,
            pricePerUnit: parseFloat(row.cells[3].querySelector('input').value)
        });
    });

    const user = supabaseClient.auth.getUser();
     if (!user) {
        alert('You must be logged in to save a recipe.');
        return;
    }
    const userId = (await user).data.user.id;


    const recipeData = {
        name,
        servings,
        total_cost,
        cost_per_serving,
        selling_price_per_serving,
        profit_per_serving,
        ingredients,
        user_id: userId // Add the user ID
    };

    let response;
    if (recipeId) {
        response = await supabaseClient
            .from('recipes')
            .update(recipeData)
            .eq('id', recipeId)
            .eq('user_id', userId); // Ensure only the owner can update
    } else {
        response = await supabaseClient
            .from('recipes')
            .insert([recipeData]);
    }

    if (response.error) {
        console.error('Error saving recipe:', response.error);
        alert('Could not save recipe.');
    } else {
        console.log('Recipe saved successfully!');
        if (!recipeId && response.data && response.data.length > 0) {
            recipeDiv.dataset.recipeId = response.data[0].id; // Store the new ID
        }
        alert('Recipe saved!');
    }
}

async function removeRecipe(button) {
    const recipeDiv = button.parentNode;
    const recipeId = recipeDiv.dataset.recipeId;

    if (!recipeId) {
        recipeDiv.parentNode.removeChild(recipeDiv); // Remove from DOM only
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this recipe?');
    if (!confirmDelete) return;

    const user = supabaseClient.auth.getUser();
     if (!user) {
        alert('You must be logged in to delete a recipe.');
        return;
    }
    const userId = (await user).data.user.id;

    const { error } = await supabaseClient
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', userId); // Ensure only the owner can delete

    if (error) {
        console.error('Error deleting recipe:', error);
        alert('Could not delete recipe.');
    } else {
        recipeDiv.parentNode.removeChild(recipeDiv);
        alert('Recipe deleted!');
    }
}

function addRecipe() {
    const recipeList = document.getElementById('recipeList');
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';
    recipeDiv.innerHTML = `
        <h2 contenteditable="true">New Recipe</h2>
        <table>
            <thead>
                <tr>
                    <th>Ingredient</th>
                    <th>Quantity Needed</th>
                    <th>Unit</th>
                    <th>Price per Unit (AED)</th>
                    <th>Cost for Recipe (AED)</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                </tbody>
        </table>
        <button onclick="addIngredient(this)">Add Ingredient</button>
        <div>
            <label>Total Servings:</label>
            <input type="number" value="1" min="1" onchange="calculateTotal(this)">
            <p>Total Cost: AED <span class="totalCost">0.00</span></p>
            <p>Cost per Serving: AED <span class="costPerServing">0.00</span></p>
            <label>Selling Price per Serving (AED):</label>
            <input type="number" value="0" min="0" onchange="calculateProfit(this)">
            <p>Estimated Profit per Serving: AED <span class="profitPerServing">0.00</span></p>
        </div>
        <button class="save-btn" onclick="saveRecipe(this)">Save Recipe</button>
        <button class="remove-btn" onclick="removeRecipe(this)">Remove Recipe</button>
    `;
    recipeList.appendChild(recipeDiv);
    addIngredient(recipeDiv.querySelector('button[onclick="addIngredient(this)"]'));
}

function addIngredient(button) {
    const tbody = button.previousElementSibling.querySelector('tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="Ingredient Name"></td>
        <td><input type="number" value="0" min="0" step="any" onchange="calculateRow(this)"></td>
        <td>
            <select>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="unit">unit</option>
            </select>
        </td>
        <td><input type="number" value="0" min="0" step="any" onchange="calculateRow(this)"></td>
        <td>AED <span>0.00</span></td>
        <td><button class="remove-btn" onclick="removeIngredient(this)">Remove</button></td>
    `;
}

function removeIngredient(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calculateTotal(button.closest('.recipe').querySelector('input[onchange="calculateTotal(this)"]'));
}

function calculateRow(input) {
    const row = input.parentNode.parentNode;
    const quantity = parseFloat(row.cells[1].querySelector('input').value);
    const pricePerUnit = parseFloat(row.cells[3].querySelector('input').value);
    const cost = quantity * pricePerUnit;
    row.cells[4].querySelector('span').textContent = cost.toFixed(2);
    calculateTotal(input.closest('.recipe').querySelector('input[onchange="calculateTotal(this)"]'));
}

function calculateTotal(input) {
    const recipeDiv = input.closest('.recipe');
    const rows = recipeDiv.querySelectorAll('tbody tr');
    let totalCost = 0;
    rows.forEach(row => {
        totalCost += parseFloat(row.cells[4].querySelector('span').textContent);
    });
    recipeDiv.querySelector('.totalCost').textContent = totalCost.toFixed(2);
    const totalServings = parseInt(recipeDiv.querySelector('input[onchange="calculateTotal(this)"]').value);
    const costPerServing = totalCost / totalServings;
    recipeDiv.querySelector('.costPerServing').textContent = costPerServing.toFixed(2);
    calculateProfit(recipeDiv.querySelector('input[onchange="calculateProfit(this)"]'));
}

function calculateProfit(input) {
    const recipeDiv = input.closest('.recipe');
    const sellingPrice = parseFloat(input.value);
    const costPerServing = parseFloat(recipeDiv.querySelector('.costPerServing').textContent);
    const profitPerServing = sellingPrice - costPerServing;
    recipeDiv.querySelector('.profitPerServing').textContent = profitPerServing.toFixed(2);
}