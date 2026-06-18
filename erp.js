const STORAGE_KEY = "boosnur-erp-v1";

const today = () => new Date().toISOString().slice(0, 10);
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const number = (value) => Number(value || 0);

const emptyState = {
  company: {
    name: "Boosnur Genetics",
    phone: "+91 88927 57959",
    email: "info@boosnurgenetics.com",
    address: "Davangere, Karnataka, India"
  },
  products: [],
  customers: [],
  invoices: [],
  payments: []
};

let state = loadState();
let draftLines = [];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyState, ...saved } : structuredClone(emptyState);
  } catch {
    return structuredClone(emptyState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 2600);
}

function invoiceNumber() {
  return `INV-${String(state.invoices.length + 1).padStart(4, "0")}`;
}

function getCustomer(id) {
  return state.customers.find((customer) => customer.id === id);
}

function getProduct(id) {
  return state.products.find((product) => product.id === id);
}

function invoiceTotals(invoice) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + line.qty * line.rate, 0);
  const tax = subtotal * number(invoice.taxRate) / 100;
  const total = subtotal + tax;
  const paid = number(invoice.paid) + state.payments
    .filter((payment) => payment.invoiceId === invoice.id)
    .reduce((sum, payment) => sum + number(payment.amount), 0);
  const due = Math.max(total - paid, 0);
  return { subtotal, tax, total, paid, due };
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  const active = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  document.getElementById("view-title").textContent = active ? active.textContent.trim() : "Dashboard";
  if (viewId === "billing") resetInvoiceForm(false);
  render();
}

function render() {
  renderSelectors();
  renderDashboard();
  renderProducts();
  renderCustomers();
  renderInvoices();
  renderLedger();
  renderReports();
  renderCompany();
  renderInvoiceDraft();
}

function renderSelectors() {
  const customerOptions = state.customers.map((customer) => `<option value="${customer.id}">${escapeHtml(customer.name)}</option>`).join("");
  document.getElementById("invoice-customer").innerHTML = customerOptions || `<option value="">Add customer first</option>`;

  const productOptions = state.products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} - ${money(product.rate)}</option>`).join("");
  document.getElementById("line-product").innerHTML = productOptions || `<option value="">Add product first</option>`;

  const unpaidOptions = state.invoices
    .filter((invoice) => invoiceTotals(invoice).due > 0)
    .map((invoice) => {
      const customer = getCustomer(invoice.customerId);
      return `<option value="${invoice.id}">${invoice.number} - ${escapeHtml(customer?.name || "Customer")} - Due ${money(invoiceTotals(invoice).due)}</option>`;
    })
    .join("");
  document.getElementById("payment-invoice").innerHTML = unpaidOptions || `<option value="">No pending invoices</option>`;
}

function renderDashboard() {
  const totals = state.invoices.map(invoiceTotals);
  const sales = totals.reduce((sum, item) => sum + item.total, 0);
  const due = totals.reduce((sum, item) => sum + item.due, 0);
  const stockValue = state.products.reduce((sum, product) => sum + number(product.stock) * number(product.rate), 0);
  const lowStock = state.products.filter((product) => number(product.stock) <= number(product.reorder)).length;

  document.getElementById("metric-sales").textContent = money(sales);
  document.getElementById("metric-due").textContent = money(due);
  document.getElementById("metric-stock").textContent = money(stockValue);
  document.getElementById("metric-low").textContent = lowStock;

  const recentRows = state.invoices.slice(-6).reverse().map((invoice) => {
    const customer = getCustomer(invoice.customerId);
    const totalsForInvoice = invoiceTotals(invoice);
    return `<tr>
      <td>${invoice.number}</td>
      <td>${escapeHtml(customer?.name || "Customer")}</td>
      <td>${invoice.date}</td>
      <td class="num">${money(totalsForInvoice.total)}</td>
      <td>${statusBadge(totalsForInvoice.due > 0 ? "Due" : "Paid")}</td>
    </tr>`;
  }).join("");
  document.getElementById("recent-invoices").innerHTML = recentRows || emptyRow("No invoices made yet", 5);

  const alerts = state.products
    .filter((product) => number(product.stock) <= number(product.reorder))
    .map((product) => `<div class="alert-item"><strong>${escapeHtml(product.name)}</strong><span>${number(product.stock)} ${escapeHtml(product.unit)} left. Reorder level ${number(product.reorder)}.</span></div>`)
    .join("");
  document.getElementById("stock-alerts").innerHTML = alerts || `<div class="alert-item"><strong>Stock looks fine</strong><span>No items are below reorder level.</span></div>`;
}

function renderProducts() {
  const q = document.getElementById("product-search").value.toLowerCase();
  const rows = state.products
    .filter((product) => [product.name, product.sku].join(" ").toLowerCase().includes(q))
    .map((product) => {
      const low = number(product.stock) <= number(product.reorder);
      return `<tr>
        <td><strong>${escapeHtml(product.name)}</strong><br><small>${escapeHtml(product.unit)}</small></td>
        <td>${escapeHtml(product.sku || "-")}</td>
        <td class="num">${number(product.stock)} ${low ? statusBadge("Low", "low") : ""}</td>
        <td class="num">${money(product.rate)}</td>
        <td class="num">${money(number(product.stock) * number(product.rate))}</td>
        <td><div class="row-actions"><button class="mini-button" data-stock-add="${product.id}" type="button">Add Stock</button><button class="mini-button" data-delete-product="${product.id}" type="button">Delete</button></div></td>
      </tr>`;
    }).join("");
  document.getElementById("product-table").innerHTML = rows || emptyRow("No products saved", 6);
}

function renderCustomers() {
  const q = document.getElementById("customer-search").value.toLowerCase();
  const rows = state.customers
    .filter((customer) => [customer.name, customer.phone, customer.email, customer.taxId].join(" ").toLowerCase().includes(q))
    .map((customer) => `<tr>
      <td><strong>${escapeHtml(customer.name)}</strong><br><small>${escapeHtml(customer.address || "")}</small></td>
      <td>${escapeHtml(customer.phone || "-")}</td>
      <td>${escapeHtml(customer.email || "-")}</td>
      <td>${escapeHtml(customer.taxId || "-")}</td>
      <td><div class="row-actions"><button class="mini-button" data-delete-customer="${customer.id}" type="button">Delete</button></div></td>
    </tr>`).join("");
  document.getElementById("customer-table").innerHTML = rows || emptyRow("No customers saved", 5);
}

function renderInvoices() {
  const q = document.getElementById("invoice-search").value.toLowerCase();
  const rows = state.invoices
    .slice()
    .reverse()
    .filter((invoice) => {
      const customer = getCustomer(invoice.customerId);
      return [invoice.number, invoice.date, customer?.name].join(" ").toLowerCase().includes(q);
    })
    .map((invoice) => {
      const customer = getCustomer(invoice.customerId);
      const totalsForInvoice = invoiceTotals(invoice);
      return `<tr>
        <td><strong>${invoice.number}</strong></td>
        <td>${invoice.date}</td>
        <td>${escapeHtml(customer?.name || "Customer")}</td>
        <td class="num">${money(totalsForInvoice.total)}</td>
        <td class="num">${money(totalsForInvoice.due)}</td>
        <td>${statusBadge(totalsForInvoice.due > 0 ? "Due" : "Paid", totalsForInvoice.due > 0 ? "due" : "")}</td>
        <td><div class="row-actions"><button class="mini-button" data-preview-invoice="${invoice.id}" type="button">Print</button><button class="mini-button" data-delete-invoice="${invoice.id}" type="button">Delete</button></div></td>
      </tr>`;
    }).join("");
  document.getElementById("invoice-table").innerHTML = rows || emptyRow("No invoices saved", 7);
}

function renderLedger() {
  const rows = state.customers.map((customer) => {
    const invoices = state.invoices.filter((invoice) => invoice.customerId === customer.id);
    const totals = invoices.map(invoiceTotals);
    const sales = totals.reduce((sum, item) => sum + item.total, 0);
    const received = totals.reduce((sum, item) => sum + item.paid, 0);
    const due = totals.reduce((sum, item) => sum + item.due, 0);
    return `<tr><td>${escapeHtml(customer.name)}</td><td class="num">${money(sales)}</td><td class="num">${money(received)}</td><td class="num">${money(due)}</td></tr>`;
  }).join("");
  document.getElementById("ledger-table").innerHTML = rows || emptyRow("No customer ledger yet", 4);
}

function renderReports() {
  const totals = state.invoices.map(invoiceTotals);
  const sales = totals.reduce((sum, item) => sum + item.total, 0);
  const received = totals.reduce((sum, item) => sum + item.paid, 0);
  const pending = totals.reduce((sum, item) => sum + item.due, 0);
  document.getElementById("report-count").textContent = state.invoices.length;
  document.getElementById("report-average").textContent = money(state.invoices.length ? sales / state.invoices.length : 0);
  document.getElementById("report-received").textContent = money(received);
  document.getElementById("report-pending").textContent = money(pending);

  const byProduct = new Map();
  state.invoices.forEach((invoice) => {
    invoice.lines.forEach((line) => {
      const current = byProduct.get(line.productName) || { qty: 0, value: 0 };
      current.qty += number(line.qty);
      current.value += number(line.qty) * number(line.rate);
      byProduct.set(line.productName, current);
    });
  });
  const rows = Array.from(byProduct.entries()).map(([name, item]) => `<tr><td>${escapeHtml(name)}</td><td class="num">${item.qty}</td><td class="num">${money(item.value)}</td></tr>`).join("");
  document.getElementById("product-sales-table").innerHTML = rows || emptyRow("No product sales yet", 3);
}

function renderCompany() {
  document.getElementById("company-name").value = state.company.name || "";
  document.getElementById("company-phone").value = state.company.phone || "";
  document.getElementById("company-email").value = state.company.email || "";
  document.getElementById("company-address").value = state.company.address || "";
}

function renderInvoiceDraft() {
  document.getElementById("invoice-number").textContent = invoiceNumber();
  const taxRate = number(document.getElementById("invoice-tax").value);
  const subtotal = draftLines.reduce((sum, line) => sum + line.qty * line.rate, 0);
  const tax = subtotal * taxRate / 100;
  const total = subtotal + tax;
  const paid = number(document.getElementById("invoice-paid").value);

  document.getElementById("sum-subtotal").textContent = money(subtotal);
  document.getElementById("sum-tax").textContent = money(tax);
  document.getElementById("sum-total").textContent = money(total);
  document.getElementById("sum-balance").textContent = money(Math.max(total - paid, 0));

  document.getElementById("invoice-lines").innerHTML = draftLines.map((line, index) => `<tr>
    <td>${escapeHtml(line.productName)}</td>
    <td class="num">${line.qty}</td>
    <td class="num">${money(line.rate)}</td>
    <td class="num">${money(line.qty * line.rate)}</td>
    <td><div class="row-actions"><button class="mini-button" data-remove-line="${index}" type="button">Remove</button></div></td>
  </tr>`).join("") || emptyRow("No items added", 5);
}

function statusBadge(text, className = "") {
  return `<span class="status ${className}">${text}</span>`;
}

function emptyRow(text, cols) {
  return `<tr><td colspan="${cols}">${text}</td></tr>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function resetInvoiceForm(showMessage = true) {
  draftLines = [];
  document.getElementById("invoice-form").reset();
  document.getElementById("invoice-date").value = today();
  document.getElementById("invoice-tax").value = 0;
  document.getElementById("invoice-paid").value = 0;
  renderInvoiceDraft();
  if (showMessage) toast("Invoice cleared");
}

function addLine() {
  const productId = document.getElementById("line-product").value;
  const product = getProduct(productId);
  if (!product) return toast("Please add a product first");
  const qty = number(document.getElementById("line-qty").value);
  const rate = number(document.getElementById("line-rate").value || product.rate);
  if (qty <= 0) return toast("Enter item quantity");
  draftLines.push({ productId, productName: product.name, unit: product.unit, qty, rate });
  document.getElementById("line-qty").value = "";
  document.getElementById("line-rate").value = "";
  renderInvoiceDraft();
}

function saveInvoice(event) {
  event.preventDefault();
  const customerId = document.getElementById("invoice-customer").value;
  if (!getCustomer(customerId)) return toast("Please add a customer first");
  if (!draftLines.length) return toast("Add at least one item to the bill");

  const stockIssue = draftLines.find((line) => number(getProduct(line.productId)?.stock) < line.qty);
  if (stockIssue) return toast(`${stockIssue.productName} does not have enough stock`);

  const invoice = {
    id: uid("invoice"),
    number: invoiceNumber(),
    customerId,
    date: document.getElementById("invoice-date").value,
    taxRate: number(document.getElementById("invoice-tax").value),
    status: document.getElementById("invoice-status").value,
    paid: number(document.getElementById("invoice-paid").value),
    notes: document.getElementById("invoice-notes").value.trim(),
    lines: draftLines.map((line) => ({ ...line }))
  };

  invoice.lines.forEach((line) => {
    const product = getProduct(line.productId);
    product.stock = number(product.stock) - number(line.qty);
  });
  state.invoices.push(invoice);
  saveState();
  resetInvoiceForm(false);
  render();
  toast(`${invoice.number} saved`);
  previewInvoice(invoice.id);
}

function previewInvoice(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;
  const customer = getCustomer(invoice.customerId);
  const totals = invoiceTotals(invoice);
  document.getElementById("print-area").innerHTML = invoiceHtml(invoice, customer, totals);
  document.getElementById("invoice-dialog").showModal();
}

function invoiceHtml(invoice, customer, totals) {
  const lineRows = invoice.lines.map((line, index) => `<tr>
    <td>${index + 1}</td>
    <td>${escapeHtml(line.productName)}</td>
    <td class="num">${line.qty} ${escapeHtml(line.unit || "")}</td>
    <td class="num">${money(line.rate)}</td>
    <td class="num">${money(line.qty * line.rate)}</td>
  </tr>`).join("");

  return `<div class="print-invoice">
    <div class="print-head">
      <div>
        <h2>${escapeHtml(state.company.name)}</h2>
        <p>${escapeHtml(state.company.address).replace(/\n/g, "<br>")}<br>${escapeHtml(state.company.phone)}<br>${escapeHtml(state.company.email)}</p>
      </div>
      <div class="print-meta">
        <strong>Tax Invoice</strong><br>
        ${invoice.number}<br>
        Date: ${invoice.date}
      </div>
    </div>
    <div class="print-grid">
      <div class="print-box"><strong>Bill To</strong>${escapeHtml(customer?.name || "")}<br>${escapeHtml(customer?.address || "").replace(/\n/g, "<br>")}<br>${escapeHtml(customer?.phone || "")}<br>${escapeHtml(customer?.taxId || "")}</div>
      <div class="print-box"><strong>Payment</strong>Status: ${totals.due > 0 ? "Due" : "Paid"}<br>Received: ${money(totals.paid)}<br>Balance: ${money(totals.due)}</div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
      <tbody>${lineRows}</tbody>
    </table>
    <div class="print-total">
      <div><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div>
      <div><span>Tax (${invoice.taxRate}%)</span><strong>${money(totals.tax)}</strong></div>
      <div><span>Total</span><strong>${money(totals.total)}</strong></div>
      <div><span>Balance</span><strong>${money(totals.due)}</strong></div>
    </div>
    <p>${escapeHtml(invoice.notes || "Thank you for your business.")}</p>
  </div>`;
}

function seedDemoData() {
  state = {
    ...structuredClone(emptyState),
    products: [
      { id: uid("product"), name: "Tomato Seeds", sku: "TOM-001", unit: "kg", rate: 4200, stock: 38, reorder: 10 },
      { id: uid("product"), name: "Chilli Seeds", sku: "CHI-001", unit: "kg", rate: 5100, stock: 24, reorder: 8 },
      { id: uid("product"), name: "Bell Pepper Seeds", sku: "BEP-001", unit: "kg", rate: 6800, stock: 6, reorder: 7 }
    ],
    customers: [
      { id: uid("customer"), name: "Green Valley Exports", phone: "+91 98765 43210", email: "buyer@example.com", taxId: "GSTIN12345", address: "Bengaluru, Karnataka" },
      { id: uid("customer"), name: "Sunrise Agro Traders", phone: "+91 90000 11111", email: "orders@example.com", taxId: "", address: "Hyderabad, Telangana" }
    ],
    invoices: [],
    payments: [],
    company: structuredClone(emptyState.company)
  };
  const tomato = state.products[0];
  const customer = state.customers[0];
  state.invoices.push({
    id: uid("invoice"),
    number: "INV-0001",
    customerId: customer.id,
    date: today(),
    taxRate: 5,
    status: "Part Paid",
    paid: 10000,
    notes: "Packed and ready for dispatch.",
    lines: [{ productId: tomato.id, productName: tomato.name, unit: tomato.unit, qty: 4, rate: tomato.rate }]
  });
  tomato.stock -= 4;
  saveState();
  resetInvoiceForm(false);
  render();
  toast("Sample data loaded");
}

function exportCsv() {
  const rows = [["Invoice", "Date", "Customer", "Total", "Received", "Due"]];
  state.invoices.forEach((invoice) => {
    const customer = getCustomer(invoice.customerId);
    const totals = invoiceTotals(invoice);
    rows.push([invoice.number, invoice.date, customer?.name || "", totals.total, totals.paid, totals.due]);
  });
  downloadFile("boosnur-sales-report.csv", rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
}

function downloadBackup() {
  downloadFile(`boosnur-erp-backup-${today()}.json`, JSON.stringify(state, null, 2), "application/json");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});
document.querySelectorAll("[data-switch-view]").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.switchView));
});
document.querySelector("[data-open-billing]").addEventListener("click", () => switchView("billing"));

document.getElementById("product-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.products.push({
    id: uid("product"),
    name: document.getElementById("product-name").value.trim(),
    sku: document.getElementById("product-sku").value.trim(),
    unit: document.getElementById("product-unit").value.trim() || "pcs",
    rate: number(document.getElementById("product-rate").value),
    stock: number(document.getElementById("product-stock").value),
    reorder: number(document.getElementById("product-reorder").value)
  });
  event.target.reset();
  document.getElementById("product-unit").value = "kg";
  document.getElementById("product-stock").value = 0;
  document.getElementById("product-reorder").value = 5;
  saveState();
  render();
  toast("Product saved");
});

document.getElementById("customer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.customers.push({
    id: uid("customer"),
    name: document.getElementById("customer-name").value.trim(),
    phone: document.getElementById("customer-phone").value.trim(),
    email: document.getElementById("customer-email").value.trim(),
    taxId: document.getElementById("customer-taxid").value.trim(),
    address: document.getElementById("customer-address").value.trim()
  });
  event.target.reset();
  saveState();
  render();
  toast("Customer saved");
});

document.getElementById("company-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.company = {
    name: document.getElementById("company-name").value.trim(),
    phone: document.getElementById("company-phone").value.trim(),
    email: document.getElementById("company-email").value.trim(),
    address: document.getElementById("company-address").value.trim()
  };
  saveState();
  toast("Company details saved");
});

document.getElementById("invoice-form").addEventListener("submit", saveInvoice);
document.getElementById("add-line").addEventListener("click", addLine);
document.getElementById("clear-invoice").addEventListener("click", () => resetInvoiceForm(true));
document.getElementById("invoice-tax").addEventListener("input", renderInvoiceDraft);
document.getElementById("invoice-paid").addEventListener("input", renderInvoiceDraft);
document.getElementById("line-product").addEventListener("change", (event) => {
  const product = getProduct(event.target.value);
  document.getElementById("line-rate").value = product ? product.rate : "";
});

document.getElementById("payment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const invoiceId = document.getElementById("payment-invoice").value;
  if (!invoiceId) return toast("No pending invoice selected");
  state.payments.push({
    id: uid("payment"),
    invoiceId,
    date: document.getElementById("payment-date").value,
    amount: number(document.getElementById("payment-amount").value),
    mode: document.getElementById("payment-mode").value
  });
  event.target.reset();
  document.getElementById("payment-date").value = today();
  saveState();
  render();
  toast("Payment recorded");
});

document.body.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.removeLine) {
    draftLines.splice(Number(target.dataset.removeLine), 1);
    renderInvoiceDraft();
  }
  if (target.dataset.previewInvoice) previewInvoice(target.dataset.previewInvoice);
  if (target.dataset.stockAdd) {
    const product = getProduct(target.dataset.stockAdd);
    const qty = Number(prompt(`Add stock for ${product.name}`));
    if (Number.isFinite(qty) && qty > 0) {
      product.stock = number(product.stock) + qty;
      saveState();
      render();
      toast("Stock updated");
    }
  }
  if (target.dataset.deleteProduct) {
    if (!confirm("Delete this product? Existing invoice history will remain, but the product will be removed from stock.")) return;
    state.products = state.products.filter((product) => product.id !== target.dataset.deleteProduct);
    saveState();
    render();
    toast("Product deleted");
  }
  if (target.dataset.deleteCustomer) {
    if (!confirm("Delete this customer? Existing invoices will keep their customer reference, but the customer will be removed from the list.")) return;
    state.customers = state.customers.filter((customer) => customer.id !== target.dataset.deleteCustomer);
    saveState();
    render();
    toast("Customer deleted");
  }
  if (target.dataset.deleteInvoice) {
    if (!confirm("Delete this invoice and restore its stock quantities?")) return;
    const invoice = state.invoices.find((item) => item.id === target.dataset.deleteInvoice);
    if (invoice) {
      invoice.lines.forEach((line) => {
        const product = getProduct(line.productId);
        if (product) product.stock = number(product.stock) + number(line.qty);
      });
    }
    state.invoices = state.invoices.filter((item) => item.id !== target.dataset.deleteInvoice);
    state.payments = state.payments.filter((payment) => payment.invoiceId !== target.dataset.deleteInvoice);
    saveState();
    render();
    toast("Invoice deleted and stock restored");
  }
});

["invoice-search", "product-search", "customer-search"].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
});

document.getElementById("close-preview").addEventListener("click", () => document.getElementById("invoice-dialog").close());
document.getElementById("print-invoice").addEventListener("click", () => window.print());
document.getElementById("seed-demo").addEventListener("click", seedDemoData);
document.getElementById("export-csv").addEventListener("click", exportCsv);
document.getElementById("download-backup").addEventListener("click", downloadBackup);
document.getElementById("clear-data").addEventListener("click", () => {
  if (!confirm("Clear all ERP data saved in this browser? Download a backup first if you need these records.")) return;
  state = structuredClone(emptyState);
  saveState();
  resetInvoiceForm(false);
  render();
  toast("All ERP data cleared");
});
document.getElementById("restore-backup").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state = { ...structuredClone(emptyState), ...JSON.parse(await file.text()) };
    saveState();
    render();
    toast("Backup restored");
  } catch {
    toast("Could not restore this backup file");
  }
  event.target.value = "";
});

document.getElementById("invoice-date").value = today();
document.getElementById("payment-date").value = today();
render();
