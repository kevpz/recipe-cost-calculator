document.addEventListener('DOMContentLoaded', function() {
    addRecipe();
});

function addRecipe() {
    const recipeList = document.getElementById('recipeList');
    const recipeCount = document.getElementsByClassName('recipe').length;
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';
    recipeDiv.innerHTML = `
        <h2 contenteditable="true">Recipe ${recipeCount + 1}</h2>
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
                <!-- Ingredient rows will be added here dynamically -->
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
        <button class="remove-btn" onclick="removeRecipe(this)">Remove Recipe</button>
    `;
    recipeList.appendChild(recipeDiv);
    addIngredient(recipeDiv.querySelector('button[onclick="addIngredient(this)"]'));
}

function removeRecipe(button) {
    const recipeDiv = button.parentNode;
    recipeDiv.parentNode.removeChild(recipeDiv);
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
