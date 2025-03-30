document.addEventListener('DOMContentLoaded', function() {
    addIngredient();
});

function addIngredient() {
    const table = document.getElementById('ingredientsTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
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
        <td><button onclick="removeIngredient(this)">Remove</button></td>
    `;
}

function removeIngredient(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calculateTotal();
}

function calculateRow(input) {
    const row = input.parentNode.parentNode;
    const quantity = parseFloat(row.cells[1].getElementsByTagName('input')[0].value);
    const pricePerUnit = parseFloat(row.cells[3].getElementsByTagName('input')[0].value);
    const cost = quantity * pricePerUnit;
    row.cells[4].getElementsByTagName('span')[0].textContent = cost.toFixed(2);
    calculateTotal();
}

function calculateTotal() {
    const table = document.getElementById('ingredientsTable').getElementsByTagName('tbody')[0];
    let totalCost = 0;
    for (let i = 0; i < table.rows.length; i++) {
        totalCost += parseFloat(table.rows[i].cells[4].getElementsByTagName('span')[0].textContent);
    }
    document.getElementById('totalCost').textContent = totalCost.toFixed(2);
    const totalServings = parseInt(document.getElementById('totalServings').value);
    const costPerServing = totalCost / totalServings;
    document.getElementById('costPerServing').textContent = costPerServing.toFixed(2);
    calculateProfit();
}

function calculateProfit() {
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
    const costPerServing = parseFloat(document.getElementById('costPerServing').textContent);
    const profitPerServing = sellingPrice - costPerServing;
    document.getElementById('profitPerServing').textContent = profitPerServing.toFixed(2);
}
