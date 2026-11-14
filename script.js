
// ======================================
// DUKAANMITRA - COMPLETE JAVASCRIPT
// Gemini AI + Offline Fallback
// ======================================


// ======================================
// 1. DATABASE
// ======================================

let customers = JSON.parse(localStorage.getItem("dm_customers")) || [];
let products = JSON.parse(localStorage.getItem("dm_products")) || [];
let sales = JSON.parse(localStorage.getItem("dm_sales")) || [];
let activities = JSON.parse(localStorage.getItem("dm_activities")) || [];

function saveData() {
    localStorage.setItem("dm_customers", JSON.stringify(customers));
    localStorage.setItem("dm_products", JSON.stringify(products));
    localStorage.setItem("dm_sales", JSON.stringify(sales));
    localStorage.setItem("dm_activities", JSON.stringify(activities));
}

function money(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function today() {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function addActivity(message) {
    activities.unshift({
        message,
        time: new Date().toLocaleString("en-IN")
    });

    activities = activities.slice(0, 10);
    saveData();
    renderActivity();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// ======================================
// 2. NAVIGATION
// ======================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    const titles = {
        dashboard: "Dashboard",
        customers: "Customer Management",
        inventory: "Inventory",
        sales: "Sales Management",
        assistant: "Voice Assistant"
    };

    const title = document.getElementById("page-title");

    if (title) {
        title.textContent = titles[pageId] || "Dashboard";
    }
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});


// ======================================
// 3. CUSTOMER MANAGEMENT
// ======================================

document.getElementById("customer-form")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();

    if (!name) return;

    customers.push({
        id: Date.now(),
        name,
        phone,
        credit: 0
    });

    saveData();
    addActivity(name + " customer added");

    this.reset();
    renderAll();

    alert("Customer successfully added!");
});

function renderCustomers() {
    const list = document.getElementById("customer-list");
    const select = document.getElementById("credit-customer");

    list.innerHTML = "";
    select.innerHTML = '<option value="">Select customer</option>';

    customers.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);

        const row = document.createElement("div");
        row.className = "data-row";

        row.innerHTML = `
            <div>
                <strong>${escapeHTML(customer.name)}</strong>
                <small>
                    ${escapeHTML(customer.phone || "No phone")} |
                    Udhaar: ${money(customer.credit)}
                </small>
            </div>
            <div class="row-actions">
                <button class="small-btn"
                    onclick="payCredit(${customer.id})">
                    Payment
                </button>
                <button class="small-btn danger-btn"
                    onclick="deleteCustomer(${customer.id})">
                    Delete
                </button>
            </div>
        `;

        list.appendChild(row);
    });

    if (!customers.length) {
        list.innerHTML = '<p class="empty">No customers added.</p>';
    }
}


// ======================================
// 4. UDHAR MANAGEMENT
// ======================================

document.getElementById("credit-form")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(document.getElementById("credit-customer").value);
    const amount = Number(document.getElementById("credit-amount").value);

    const customer = customers.find(c => c.id === id);

    if (!customer || !Number.isFinite(amount) || amount <= 0) {
        return;
    }

    customer.credit = Number(customer.credit || 0) + amount;

    saveData();
    addActivity(customer.name + " ka udhaar " + money(amount) + " badha");

    this.reset();
    renderAll();

    alert("Udhaar successfully recorded!");
});

function payCredit(id) {
    const customer = customers.find(c => c.id === id);

    if (!customer || customer.credit <= 0) {
        alert("No pending udhaar!");
        return;
    }

    const amount = Number(
        prompt("Payment received (₹). Pending: " + money(customer.credit))
    );

    if (!Number.isFinite(amount) || amount <= 0) return;

    if (amount > customer.credit) {
        alert("Payment pending balance se zyada nahi ho sakti.");
        return;
    }

    customer.credit -= amount;

    saveData();
    addActivity(customer.name + " se " + money(amount) + " payment received");

    renderAll();
}

function deleteCustomer(id) {
    const customer = customers.find(c => c.id === id);

    if (!customer) return;

    if (customer.credit > 0) {
        alert("Pehle customer ka pending udhaar settle karein.");
        return;
    }

    if (!confirm("Delete this customer?")) return;

    customers = customers.filter(c => c.id !== id);

    saveData();
    renderAll();
}


// ======================================
// 5. INVENTORY MANAGEMENT
// ======================================

document.getElementById("product-form")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("product-name").value.trim();
    const qty = Number(document.getElementById("product-qty").value);
    const price = Number(document.getElementById("product-price").value);

    if (!name || !Number.isInteger(qty) || qty < 0 ||
        !Number.isFinite(price) || price < 0) {
        return;
    }

    products.push({
        id: Date.now(),
        name,
        qty,
        price
    });

    saveData();
    addActivity(name + " inventory mein add hua");

    this.reset();
    renderAll();

    alert("Product added successfully!");
});

function renderProducts() {
    const list = document.getElementById("product-list");
    const select = document.getElementById("sale-product");

    list.innerHTML = "";
    select.innerHTML = '<option value="">Select product</option>';

    products.forEach(product => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.name + " - " + money(product.price);
        select.appendChild(option);

        const row = document.createElement("div");
        row.className = "data-row";

        row.innerHTML = `
            <div>
                <strong>${escapeHTML(product.name)}</strong>
                <small>
                    Stock: ${product.qty} |
                    Price: ${money(product.price)}
                </small>
            </div>
            <div class="row-actions">
                <button class="small-btn"
                    onclick="changeStock(${product.id})">
                    Add Stock
                </button>
                <button class="small-btn danger-btn"
                    onclick="deleteProduct(${product.id})">
                    Delete
                </button>
            </div>
        `;

        list.appendChild(row);
    });

    if (!products.length) {
        list.innerHTML = '<p class="empty">No products added.</p>';
    }
}

function changeStock(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const qty = Number(prompt("Kitna stock add karna hai?"));

    if (!Number.isInteger(qty) || qty <= 0) return;

    product.qty += qty;

    saveData();
    addActivity(product.name + " stock mein " + qty + " add hua");

    renderAll();
}

function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    products = products.filter(p => p.id !== id);

    saveData();
    renderAll();
}


// ======================================
// 6. SALES MANAGEMENT
// ======================================

document.getElementById("sale-form")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(document.getElementById("sale-product").value);
    const qty = Number(document.getElementById("sale-qty").value);

    const product = products.find(p => p.id === id);

    if (!product || !Number.isInteger(qty) || qty <= 0) return;

    if (qty > product.qty) {
        alert("Insufficient stock!");
        return;
    }

    const total = qty * product.price;

    product.qty -= qty;

    sales.push({
        id: Date.now(),
        product: product.name,
        qty,
        total,
        date: today()
    });

    saveData();
    addActivity(product.name + " ki " + qty + " quantity sale hui");

    this.reset();
    renderAll();

    alert("Sale recorded: " + money(total));
});

function renderSales() {
    const list = document.getElementById("sales-list");
    list.innerHTML = "";

    [...sales].reverse().forEach(sale => {
        const row = document.createElement("div");
        row.className = "data-row";

        row.innerHTML = `
            <div>
                <strong>${escapeHTML(sale.product)}</strong>
                <small>${sale.qty} units | ${escapeHTML(sale.date)}</small>
            </div>
            <strong>${money(sale.total)}</strong>
        `;

        list.appendChild(row);
    });

    if (!sales.length) {
        list.innerHTML = '<p class="empty">No sales recorded.</p>';
    }
}


// ======================================
// 7. DASHBOARD
// ======================================

function renderDashboard() {
    const todaySales = sales
        .filter(sale => sale.date === today())
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    const totalCredit = customers.reduce(
        (sum, customer) => sum + Number(customer.credit || 0),
        0
    );

    const lowStock = products.filter(
        product => Number(product.qty) <= 5
    ).length;

    document.getElementById("total-sales").textContent = money(todaySales);
    document.getElementById("total-credit").textContent = money(totalCredit);
    document.getElementById("total-customers").textContent = customers.length;
    document.getElementById("low-stock").textContent = lowStock;
}

function renderActivity() {
    const list = document.getElementById("recent-activity");

    if (!activities.length) {
        list.innerHTML = '<p class="empty">No activity yet.</p>';
        return;
    }

    list.innerHTML = activities.map(activity => `
        <div class="data-row">
            <div>
                <strong>${escapeHTML(activity.message)}</strong>
                <small>${escapeHTML(activity.time)}</small>
            </div>
        </div>
    `).join("");
}

function renderAll() {
    renderCustomers();
    renderProducts();
    renderSales();
    renderDashboard();
    renderActivity();
}


// ======================================
// 8. HINDI TO ENGLISH TRANSLITERATION
// ======================================

function devanagariToLatin(input) {
    const vowels = {
        "अ": "a", "आ": "aa", "इ": "i", "ई": "ee",
        "उ": "u", "ऊ": "oo", "ऋ": "ri",
        "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au"
    };

    const matras = {
        "ा": "aa", "ि": "i", "ी": "ee",
        "ु": "u", "ू": "oo", "ृ": "ri",
        "े": "e", "ै": "ai", "ो": "o", "ौ": "au"
    };

    const consonants = {
        "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
        "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
        "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
        "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
        "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
        "य": "y", "र": "r", "ल": "l", "व": "v",
        "श": "sh", "ष": "sh", "स": "s", "ह": "h"
    };

    let output = "";

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const next = input[i + 1];

        if (consonants[char]) {
            output += consonants[char];

            if (next === "्") {
                i++;
            } else if (matras[next]) {
                output += matras[next];
                i++;
            } else {
                output += "a";
            }
        } else if (vowels[char]) {
            output += vowels[char];
        } else if (char === "ं" || char === "ँ") {
            output += "n";
        } else if (char === "ः") {
            output += "h";
        } else if (char === "़") {
            // Nukta: ignore
        } else {
            output += char;
        }
    }

    // Hindi words ke end ka silent 'a' remove karo
    output = output.replace(/a(?=\s|$)/g, "");

    return output;
}

function normalizeText(input) {
    return devanagariToLatin(String(input || ""))
        .toLowerCase()
        .replace(/[।,!?]/g, " ")
        .replace(/[₹]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function findByName(list, spokenName) {
    const target = normalizeText(spokenName);

    return list.find(item =>
        normalizeText(item.name) === target
    );
}


// ======================================
// 9. VOICE RECOGNITION
// ======================================

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listening = false;

const voiceBtn = document.getElementById("voice-btn");

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        listening = true;
        voiceBtn.textContent = "🔴 Listening...";

        document.getElementById("voice-status").textContent =
            "Aapki command sun raha hoon...";
    };

    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript;

        document.getElementById("recognized-text").textContent = command;

        handleAssistantCommand(command);
    };

    recognition.onerror = function(event) {
        document.getElementById("voice-status").textContent =
            "Voice error: " + event.error;
    };

    recognition.onend = function() {
        listening = false;
        voiceBtn.textContent = "🎙️ Start Speaking";
    };
} else {
    document.getElementById("voice-status").textContent =
        "Voice recognition is not supported. Try Microsoft Edge.";

    voiceBtn.disabled = true;
}

voiceBtn.addEventListener("click", function() {
    if (!recognition) return;

    if (listening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (error) {
            document.getElementById("voice-status").textContent =
                "Please wait and try again.";
        }
    }
});


// ======================================
// 10. TEXT TO SPEECH
// ======================================

function speak(message) {
    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "hi-IN";
    speech.rate = 0.95;

    speechSynthesis.speak(speech);
}

function respond(message) {
    document.getElementById("assistant-response").textContent = message;
    speak(message);
}


// ======================================
// 11. GEMINI WORKER CONNECTION
// ======================================

const GEMINI_WORKER_URL =
    "https://dukaanmitra-ai.ayushmaurya0212.workers.dev";

async function askGemini(command) {
    const cleanCommand = String(command || "").trim();

    if (!cleanCommand) {
        throw new Error("Empty voice command");
    }

    console.log("Sending to Gemini:", cleanCommand);

    const response = await fetch(GEMINI_WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            command: cleanCommand
        })
    });

    const responseText = await response.text();

    console.log("Gemini HTTP status:", response.status);
    console.log("Gemini raw response:", responseText);

    if (!response.ok) {
        throw new Error("Worker error: " + response.status);
    }

    let data;

    try {
        data = JSON.parse(responseText);
    } catch (error) {
        throw new Error("Invalid Worker JSON response");
    }

    if (!data.normalizedCommand) {
        throw new Error("Gemini did not return a command");
    }

    return data.normalizedCommand;
}


// ======================================
// 12. OFFLINE FALLBACK
// ======================================

function offlineNormalize(command) {
    let text = String(command || "").toLowerCase();

    // Hindi numbers to English numbers
    const digits = "०१२३४५६७८९";

    text = text.replace(/[०-९]/g, digit =>
        digits.indexOf(digit)
    );

    // Hindi command words
    const replacements = [
        [/के नाम/g, " ke naam "],
        [/का/g, " ka "],
        [/की/g, " ki "],
        [/के/g, " ke "],
        [/को/g, " ko "],
        [/स्टॉक/g, " stock "],
        [/ऐड करो|ऐड करें|जोड़ो|जोड़ दो|डाल दो|जमा करो/g, " add "],
        [/रुपये|रुपए|रुपया/g, " rupaye "],
        [/उधार/g, " udhaar "],
        [/आज की कुल बिक्री/g, " aaj ki total sale "],
        [/आज की/g, " aaj ki "],
        [/कुल बिक्री|कुल बिकरी|बिक्री/g, " total sale "],
        [/बताओ|बताइए|दिखाओ/g, " batao "],
        [/कितना/g, " kitna "],
        [/कस्टमर|ग्राहक/g, " customer "]
    ];

    replacements.forEach(([pattern, replacement]) => {
        text = text.replace(pattern, replacement);
    });

    return normalizeText(text);
}


// ======================================
// 13. GEMINI + OFFLINE HANDLER
// ======================================

async function handleAssistantCommand(command) {
    const status = document.getElementById("voice-status");

    try {
        if (status) {
            status.textContent = "Gemini AI command samajh raha hai...";
        }

        console.log("VOICE COMMAND RECEIVED:", command);

        const normalized = await askGemini(command);

        console.log("GEMINI NORMALIZED:", normalized);

        if (status) {
            status.textContent = "Gemini AI active";
        }

        processCommand(normalized);

    } catch (error) {
        console.warn("Gemini fallback:", error.message);

        if (status) {
            status.textContent = "Offline mode active";
        }

        const offlineCommand = offlineNormalize(command);

        console.log("OFFLINE COMMAND:", offlineCommand);

        processCommand(offlineCommand);
    }
}


// ======================================
// 14. COMMAND PROCESSING
// ======================================

function processCommand(command) {
    const text = normalizeText(command);

    console.log("FINAL COMMAND:", text);

    if (!text) {
        return respond("Command khaali hai. Dobara boliye.");
    }


    // ----------------------------------
    // CUSTOMER CREDIT ADD
    // Ramesh ke naam 100 udhaar
    // Ramesh ke naam 100 add
    // ----------------------------------

   const creditMatch = text.match(
    /^(.+?)\s+(?:ke\s+naam|ka\s+naam|k\s+naam|ko)\s+₹?\s*(\d+)\s*(?:rupaye|rupees|rs)?\s*udhaar/
);
    if (creditMatch) {
        const name = creditMatch[1].trim();
        const amount = Number(creditMatch[2]);

        const customer = findByName(customers, name);

        if (!customer) {
            return respond(
                name + " customer list mein nahi mila. Pehle customer add karein."
            );
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return respond("Amount sahi nahi hai.");
        }

        customer.credit = Number(customer.credit || 0) + amount;

        saveData();
        addActivity(
            customer.name + " ka udhaar " + money(amount) + " badha"
        );

        renderAll();

        return respond(
            customer.name + " ka " + amount + " rupaye udhaar add kar diya."
        );
    }


    // ----------------------------------
    // TOTAL SALES
    // Aaj ki total sale batao
    // ----------------------------------

    if (
        text.includes("total sale") ||
        text.includes("aaj ki sale") ||
        text.includes("kul bikri") ||
        text.includes("bikri batao")
    ) {
        const total = sales
            .filter(s => s.date === today())
            .reduce((sum, s) => sum + Number(s.total || 0), 0);

        return respond(
            "Aaj ki total sale " + total + " rupaye hai."
        );
    }


    // ----------------------------------
    // CUSTOMER CREDIT QUERY
    // Ramesh ka udhaar batao
    // ----------------------------------

    const queryMatch = text.match(
        /^(.+?)\s+(?:ka|ke)\s+udhaar(?:\s+(?:batao|kitna|dikhao))?$/
    );

    if (queryMatch) {
        const name = queryMatch[1].trim();
        const customer = findByName(customers, name);

        if (!customer) {
            return respond("Ye customer nahi mila.");
        }

        return respond(
            customer.name + " ka pending udhaar " +
            customer.credit + " rupaye hai."
        );
    }


    // ----------------------------------
    // ADD INVENTORY STOCK
    // Doodh ka stock 10 add
    // ----------------------------------

    const stockMatch = text.match(
        /^(.+?)\s+(?:ka|ke)\s+stock\s+(\d+)\s+add\b/
    );

    if (stockMatch) {
        const name = stockMatch[1].trim();
        const qty = Number(stockMatch[2]);

        const product = findByName(products, name);

        if (!product) {
            return respond(
                name + " product inventory mein nahi mila. Product ka naam check karein."
            );
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            return respond("Stock quantity sahi nahi hai.");
        }

        product.qty = Number(product.qty || 0) + qty;

        saveData();
        addActivity(
            product.name + " stock mein " + qty + " add hua"
        );

        renderAll();

        return respond(
            product.name + " ka stock " + qty +
            " add kar diya. Ab total stock " + product.qty + " hai."
        );
    }


    // ----------------------------------
    // CUSTOMER COUNT
    // ----------------------------------

    if (
        text.includes("kitne customer") ||
        text.includes("customer count")
    ) {
        return respond(
            "Aapke paas " + customers.length + " customers hain."
        );
    }


    // ----------------------------------
    // UNKNOWN COMMAND
    // ----------------------------------

    return respond(
        "Maaf kijiye, command samajh nahi aayi. Kripya dobara boliye."
    );
}


// ======================================
// 15. START APPLICATION
// ======================================

renderAll();

console.log("DukaanMitra application started successfully.");