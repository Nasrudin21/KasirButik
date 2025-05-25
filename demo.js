let cart = [];
let total = 0;

function addProduct() {
  const name = prompt("Nama Produk:");
  const price = parseInt(prompt("Harga:"));
  if (name && price) {
    const container = document.getElementById("productContainer");
    const btn = document.createElement("button");
    btn.textContent = name + " - Rp " + price;
    btn.onclick = () => addToCart(name, price);
    container.appendChild(btn);
  }
}

function addToCart(name, price) {
  const product = products.find((p) => p.name === name);
  if (!product) {
    alert("Produk tidak ditemukan!");
    return;
  }

  const itemInCart = cart.find((i) => i.name === name);
  const quantityInCart = itemInCart ? itemInCart.qty : 0;

  if (product.stock <= quantityInCart) {
    alert("Stok tidak cukup!");
    return;
  }

  if (itemInCart) {
    itemInCart.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCart();
  showTransaksiSection();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  total = 0;
  cart.forEach((item, index) => {
    const totalItem = item.qty * item.price;
    total += totalItem;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>Rp ${item.price}</td>
      <td>Rp ${totalItem}</td>
      <td><button onclick="removeItem(${index})">Hapus</button></td>`;
    tbody.appendChild(row);
  });
  document.getElementById("totalAmount").textContent = total;
}

function closeModal() {
  document.getElementById("paymentModal").classList.remove("show");
}
// Menambahkan event listener untuk toggle metode pembayaran
function showModal() {
  document.getElementById("modalTotal").textContent = total;
  document.getElementById("cashInput").value = "";
  document.getElementById("changeAmount").textContent = "0";
  document.getElementById("paymentReference").value = "";

  // Default ke pembayaran tunai
  document.getElementById("cashPayment").checked = true;
  togglePaymentMethod("cash");
  document.getElementById("paymentModal").classList.add("show");
}

// Fungsi untuk toggle antara metode pembayaran
function togglePaymentMethod(method) {
  const cashForm = document.getElementById("cashPaymentForm");
  const qrForm = document.getElementById("qrPaymentForm");

  if (method === "cash") {
    cashForm.style.display = "block";
    qrForm.style.display = "none";
  } else {
    cashForm.style.display = "none";
    qrForm.style.display = "block";
  }
}

// Fungsi untuk menangani perubahan metode pembayaran
document.addEventListener("DOMContentLoaded", function () {
  // Tambahkan event listener setelah DOM selesai dimuat
  const cashRadio = document.getElementById("cashPayment");
  const qrRadio = document.getElementById("qrPayment");

  if (cashRadio && qrRadio) {
    cashRadio.addEventListener("change", function () {
      if (this.checked) {
        togglePaymentMethod("cash");
      }
    });

    qrRadio.addEventListener("change", function () {
      if (this.checked) {
        togglePaymentMethod("qr");
      }
    });
  }
});

// Modifikasi fungsi processPayment untuk mendukung QR payment
function processPayment() {
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;

  if (paymentMethod === "cash") {
    // Proses pembayaran tunai
    const cash = parseInt(document.getElementById("cashInput").value);
    if (isNaN(cash) || cash < total) {
      alert("Uang tidak cukup!");
      return;
    }
    const change = cash - total;
    document.getElementById("changeAmount").textContent = change;

    // Simpan transaksi dengan metode tunai
    saveTransaction(cash, change, "Tunai");
    showReceipt(cash, change, "Tunai");
  } else {
    // Proses pembayaran QR
    const referenceNumber = document
      .getElementById("paymentReference")
      .value.trim();
    if (!referenceNumber) {
      alert("Masukkan nomor referensi pembayaran!");
      return;
    }

    // Simpan transaksi dengan metode QR
    saveTransaction(total, 0, "Transfer BNI", referenceNumber);
    showReceipt(total, 0, "Transfer BNI", referenceNumber);
  }

  closeModal();
}

// Modifikasi fungsi saveTransaction untuk menyimpan metode pembayaran
function saveTransaction(cash, change, paymentMethod, referenceNumber = "") {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID");
  const timeStr = now.toLocaleTimeString("id-ID");

  const items = cart.map((item) => {
    const product = products.find((p) => p.name === item.name);
    if (product) {
      product.stock -= item.qty;
      if (product.stock < 0) product.stock = 0;
    }
    return {
      name: item.name,
      price: item.price,
      qty: item.qty,
    };
  });

  const transaction = {
    date: dateStr,
    time: timeStr,
    items: items,
    total: total,
    cash: cash,
    change: change,
    paymentMethod: paymentMethod,
    referenceNumber: referenceNumber,
    timestamp: now.getTime(),
  };

  salesData.push(transaction);
  localStorage.setItem("salesData", JSON.stringify(salesData));
  saveProducts(); // <- Simpan stok yang sudah diperbarui
  updateSalesReport();
}

// Modifikasi fungsi showReceipt untuk menampilkan metode pembayaran
function showReceipt(cash, change, paymentMethod, referenceNumber = "") {
  const receipt = document.getElementById("receiptContent");

  let paymentInfo = "";
  if (paymentMethod === "Tunai") {
    paymentInfo = `
      <p>Metode Pembayaran: ${paymentMethod}</p>
      <p>Bayar: Rp ${cash}</p>
      <p>Kembalian: Rp ${change}</p>
    `;
  } else {
    paymentInfo = `
      <p>Metode Pembayaran: ${paymentMethod}</p>
      <p>Nomor Referensi: ${referenceNumber}</p>
      <p>Total Dibayar: Rp ${total}</p>
    `;
  }

  receipt.innerHTML = `
    <p><strong>Struk Pembayaran</strong></p>
    <p>Total: Rp ${total}</p>
    ${paymentInfo}
    <hr />
    <ul>
      ${cart
        .map(
          (item) =>
            `<li>${item.qty}x ${item.name} - Rp ${item.price * item.qty}</li>`
        )
        .join("")}
    </ul>`;

  // Reset input nomor telepon pelanggan setiap kali menampilkan struk baru
  document.getElementById("customerPhone").value = "";

  document.getElementById("receiptModal").classList.add("show");

  // Simpan salinan keranjang sebelum mengosongkannya
  const tempCart = [...cart];
  cart = [];
  updateCart();
  displayProducts(); // untuk refresh stok pada UI
}

// Modifikasi fungsi updateSalesReport untuk menampilkan metode pembayaran
function updateSalesReport() {
  // Update summary metrics
  document.getElementById("totalTransactions").textContent = salesData.length;

  const totalRevenue = salesData.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );
  document.getElementById("totalRevenue").textContent = totalRevenue;

  const avgTransaction =
    salesData.length > 0 ? totalRevenue / salesData.length : 0;
  document.getElementById("averageTransaction").textContent =
    avgTransaction.toFixed(0);

  // Update table
  const tableBody = document.getElementById("salesTableBody");
  tableBody.innerHTML = "";

  salesData.forEach((transaction) => {
    const paymentInfo =
      transaction.paymentMethod === "Tunai"
        ? `Rp ${transaction.cash} (Kembali: Rp ${transaction.change})`
        : `${transaction.paymentMethod} (Ref: ${transaction.referenceNumber})`;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${transaction.date}</td>
        <td>${transaction.time}</td>
        <td>${transaction.items.reduce(
          (text, item) => text + `${item.qty}x ${item.name}<br>`,
          ""
        )}
        </td>
        <td>Rp ${transaction.total}</td>
        <td>${transaction.paymentMethod || "Tunai"}</td>
        <td>${
          transaction.paymentMethod === "Tunai"
            ? "Rp " + transaction.change
            : "-"
        }</td>
      `;
    tableBody.appendChild(row);
  });
}

// Modifikasi fungsi sendToWhatsApp untuk menyertakan metode pembayaran
function sendToWhatsApp() {
  const phoneNumber = document.getElementById("customerPhone").value.trim();

  if (!phoneNumber) {
    alert("Silakan masukkan nomor WhatsApp pelanggan!");
    return;
  }

  // Memastikan format nomor benar (+62xxx atau 62xxx)
  let formattedNumber = phoneNumber;
  if (phoneNumber.startsWith("0")) {
    formattedNumber = "62" + phoneNumber.substring(1);
  } else if (!phoneNumber.startsWith("62") && !phoneNumber.startsWith("+62")) {
    formattedNumber = "62" + phoneNumber;
  }

  // Mengambil data transaksi terakhir
  const lastTransaction = salesData[salesData.length - 1];

  // Membuat pesan untuk WhatsApp dengan metode pembayaran
  const cartItems = lastTransaction.items
    .map((item) => `${item.qty}x ${item.name} - Rp ${item.price * item.qty}`)
    .join("\n");

  let paymentInfo = "";
  if (lastTransaction.paymentMethod === "Tunai") {
    paymentInfo = `*Metode Pembayaran:* ${lastTransaction.paymentMethod}
*Bayar:* Rp ${lastTransaction.cash}
*Kembalian:* Rp ${lastTransaction.change}`;
  } else {
    paymentInfo = `*Metode Pembayaran:* ${lastTransaction.paymentMethod}
*Nomor Referensi:* ${lastTransaction.referenceNumber}`;
  }

  const message = `
*STRUK PEMBAYARAN BUTIK ALRATZ*
----------------------------
${cartItems}
----------------------------
*Total:* Rp ${lastTransaction.total}
${paymentInfo}

Terima kasih atas pembelian Anda!
  `;

  // Encode pesan untuk URL
  const encodedMessage = encodeURIComponent(message);

  // Buka link WhatsApp
  const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
}

function showReceipt(cash, change) {
  const receipt = document.getElementById("receiptContent");
  receipt.innerHTML = `
    <p><strong>Struk Pembayaran</strong></p>
    <p>Total: Rp ${total}</p>
    <p>Bayar: Rp ${cash}</p>
    <p>Kembalian: Rp ${change}</p>
    <hr />
    <ul>
      ${cart
        .map(
          (item) =>
            `<li>${item.qty}x ${item.name} - Rp ${item.price * item.qty}</li>`
        )
        .join("")}
    </ul>`;
  document.getElementById("receiptModal").classList.add("show");
  cart = [];
  updateCart();
}

function closeReceipt() {
  document.getElementById("receiptModal").classList.remove("show");
}

document.addEventListener("DOMContentLoaded", function () {
  const dashboardSection = document.querySelector(".dashboard");
  const transaksiSection = document.querySelector(".cart");
  const laporanSection = document.querySelector(".laporan");

  function showSection(index) {
    dashboardSection.style.display = index === 0 ? "block" : "none";
    document.querySelector(".product-list").style.display =
      index === 1 ? "block" : "none";
    transaksiSection.style.display = index === 1 ? "block" : "none";
    laporanSection.style.display = index === 2 ? "block" : "none";
  }

  document.querySelectorAll(".nav-link").forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showSection(index);
    });
  });
  showSection(0); // Tampilkan Dashboard pertama kali
});

// Array untuk menyimpan data transaksi
let salesData = [];

// Fungsi untuk filter berdasarkan tanggal
function filterSales() {
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);
  endDate.setHours(23, 59, 59, 999); // Set to end of day

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    alert("Pilih tanggal yang valid");
    return;
  }

  const filteredData = salesData.filter((transaction) => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Update metrics
  document.getElementById("totalTransactions").textContent =
    filteredData.length;

  const totalRevenue = filteredData.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );
  document.getElementById("totalRevenue").textContent = totalRevenue;

  const avgTransaction =
    filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
  document.getElementById("averageTransaction").textContent =
    avgTransaction.toFixed(0);

  // Update table
  const tableBody = document.getElementById("salesTableBody");
  tableBody.innerHTML = "";

  filteredData.forEach((transaction) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${transaction.date}</td>
        <td>${transaction.time}</td>
        <td>${transaction.items.reduce(
          (text, item) => text + `${item.qty}x ${item.name}<br>`,
          ""
        )}
        </td>
        <td>Rp ${transaction.total}</td>
        <td>Rp ${transaction.cash}</td>
        <td>Rp ${transaction.change}</td>
      `;
    tableBody.appendChild(row);
  });
}

// Fungsi untuk reset filter
function resetFilter() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  updateSalesReport();
}

// Modifikasi fungsi processPayment untuk menyimpan transaksi
function processPayment() {
  const cash = parseInt(document.getElementById("cashInput").value);
  if (isNaN(cash) || cash < total) {
    alert("Uang tidak cukup!");
    return;
  }
  const change = cash - total;
  document.getElementById("changeAmount").textContent = change;

  // Simpan transaksi ke dalam data penjualan
  saveTransaction(cash, change);

  showReceipt(cash, change);
  closeModal();
}

// Load saved data when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadSalesData();

  // Set tanggal default untuk filter (hari ini)
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").value = today;
  document.getElementById("endDate").value = today;
});

// Fungsi untuk mencetak struk
function printReceipt() {
  // Menyimpan konten asli halaman
  const originalContents = document.body.innerHTML;

  // Mengambil hanya konten struk
  const receiptContents = document.getElementById("receiptContent").innerHTML;

  // Membuat halaman cetak yang bersih dengan header butik
  const printContents = `
    <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 5px;">Butik Alratz</h2>
        <p>Jl. Contoh No. 123, Kota</p>
        <p>Telp: 021-1234567</p>
        <hr style="border-top: 1px dashed #000; margin: 10px 0;">
      </div>
      ${receiptContents}
      <div style="text-align: center; margin-top: 20px;">
        <p>Terima Kasih Atas Kunjungan Anda</p>
        <p>Tanggal: ${new Date().toLocaleString("id-ID")}</p>
      </div>
    </div>
  `;

  // Mengganti isi halaman dengan struk untuk dicetak
  document.body.innerHTML = printContents;

  // Memicu dialog cetak browser
  window.print();

  // Mengembalikan halaman ke konten asli
  document.body.innerHTML = originalContents;

  // Memastikan event handler tetap bekerja setelah print
  reattachEventHandlers();
}

// Fungsi untuk mengirim struk via WhatsApp
function sendToWhatsApp() {
  const phoneNumber = document.getElementById("customerPhone").value.trim();

  if (!phoneNumber) {
    alert("Silakan masukkan nomor WhatsApp pelanggan!");
    return;
  }

  // Memastikan format nomor benar (+62xxx atau 62xxx)
  let formattedNumber = phoneNumber;
  if (phoneNumber.startsWith("0")) {
    formattedNumber = "62" + phoneNumber.substring(1);
  } else if (!phoneNumber.startsWith("62") && !phoneNumber.startsWith("+62")) {
    formattedNumber = "62" + phoneNumber;
  }

  // Mengambil data struk dari konten struk
  const receiptElement = document.getElementById("receiptContent");

  // Membuat pesan untuk WhatsApp
  const cartItems =
    cart.length > 0
      ? cart
          .map(
            (item) => `${item.qty}x ${item.name} - Rp ${item.price * item.qty}`
          )
          .join("\n")
      : salesData[salesData.length - 1].items
          .map(
            (item) => `${item.qty}x ${item.name} - Rp ${item.price * item.qty}`
          )
          .join("\n");

  const receiptTotal =
    total > 0 ? total : salesData[salesData.length - 1].total;
  const cash =
    document.getElementById("cashInput").value ||
    salesData[salesData.length - 1].cash;
  const change = cash - receiptTotal;

  const message = `
*STRUK PEMBAYARAN BUTIK ALRATZ*
----------------------------
${cartItems}
----------------------------
*Total:* Rp ${receiptTotal}
*Bayar:* Rp ${cash}
*Kembalian:* Rp ${change}

Terima kasih atas pembelian Anda!
  `;

  // Encode pesan untuk URL
  const encodedMessage = encodeURIComponent(message);

  // Buka link WhatsApp
  const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
}

// Fungsi untuk memasang kembali event handler setelah print
function reattachEventHandlers() {
  // Memasang kembali navigation handler
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  links.forEach((link, i) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      sections.forEach((section, j) => {
        section.style.display = i === j ? "block" : "none";
      });
    });
  });

  // Memasang kembali event handler lainnya yang diperlukan
  document
    .getElementById("receiptModal")
    .querySelector("button:last-child").onclick = closeReceipt;
}

//

//
// Fungsi untuk menampilkan modal konfirmasi logout
function logout() {
  // Tampilkan modal konfirmasi logout
  document.getElementById("logoutModal").style.display = "flex";
}

// Fungsi untuk mengonfirmasi logout dan redirect ke halaman login
function confirmLogout() {
  // Simpan data penting ke sessionStorage jika diperlukan
  // Contoh: sessionStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));

  // Hapus data session user
  sessionStorage.removeItem("userSession");
  localStorage.removeItem("userToken");

  // Tampilkan pesan sukses
  alert("Anda berhasil logout dari sistem");

  // Redirect ke halaman login
  window.location.href = "login.php";
}

// Fungsi untuk menutup modal konfirmasi logout
function closeLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
}

// Fungsi untuk memeriksa status login saat halaman dimuat
function checkLoginStatus() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    // Jika token tidak ada, arahkan ke halaman login
    window.location.replace = "login.php";
  }
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Periksa status login
  checkLoginStatus();

  // Pastikan sidebar memiliki posisi relatif untuk posisi logout yang tepat
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.style.position = "relative";
    sidebar.style.display = "flex";
    sidebar.style.flexDirection = "column";
    sidebar.style.height = "100vh";
  }
});

// tombol kurang dan tambah
function updateCart() {
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  total = 0;
  cart.forEach((item, index) => {
    const totalItem = item.qty * item.price;
    total += totalItem;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <button onclick="decreaseQty(${index})">-</button>
        <span style="margin: 0 8px;">${item.qty}</span>
        <button onclick="increaseQty(${index})">+</button>
      </td>
      <td>Rp ${item.price}</td>
      <td>Rp ${totalItem}</td>
      <td>
        <button onclick="removeItem(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  document.getElementById("totalAmount").textContent = total;
}
function increaseQty(index) {
  cart[index].qty++;
  updateCart();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    alert("Qty tidak boleh kurang dari 1.");
  }
  updateCart();
}

// Array untuk menyimpan data produk
let products = [
  {
    id: 1,
    name: "Kemeja Putih",
    price: 150000,
    category: "Pakaian",
    stock: 10,
  },
  {
    id: 2,
    name: "Kebaya",
    price: 250000,
    category: "Pakaian",
    stock: 10,
  },
  {
    id: 3,
    name: "Dress Casual",
    price: 350000,
    category: "Pakaian",
    stock: 10,
  },
  {
    id: 4,
    name: "Hijab Pashmina",
    price: 180000,
    category: "Pakaian",
    stock: 10,
  },
  { id: 5, name: "Gamis", price: 450000, category: "Pakaian", stock: 10 },
  {
    id: 6,
    name: "Bros Hijab",
    price: 90000,
    category: "Aksesoris",
    stock: 10,
  },
  {
    id: 7,
    name: "Scarf Syal",
    price: 120000,
    category: "Aksesoris",
    stock: 10,
  },
  {
    id: 8,
    name: "Kalung Hijab",
    price: 280000,
    category: "Aksesoris",
    stock: 10,
  },
  {
    id: 9,
    name: "Flatshoes",
    price: 350000,
    category: "Sepatu",
    stock: 10,
  },
  { id: 10, name: "High Heels", price: 120000, category: "Sepatu", stock: 10 },
];

// Fungsi untuk menyimpan produk ke localStorage
function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

// Fungsi untuk memuat produk dari localStorage
function loadProducts() {
  localStorage.removeItem("products");
  saveProducts();
}

// Fungsi untuk menampilkan produk di dashboard
function displayProducts() {
  const productContainer = document.getElementById("productDisplay");
  if (!productContainer) return;

  productContainer.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <h3>${product.name}</h3>
      <p>Kategori: ${product.category}</p>
      <p>Stok: ${product.stock}</p>
      <p class="price">Rp ${product.price.toLocaleString("id-ID")}</p>
      <button onclick="addToCart('${product.name}', ${product.price})" ${
      product.stock === 0 ? "disabled" : ""
    }>
        ${product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
      </button>
      <div class="stok-buttons">
        <button onclick="editStock(${product.id}, 1)">+ Stok</button>
        <button onclick="editStock(${product.id}, -1)">- Stok</button>
      </div>
    `;
    productContainer.appendChild(productCard);
  });
}
// Fungsi untuk mengedit stok secara manual dari dashboard
function editStock(productId, change) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.stock += change;
    if (product.stock < 0) product.stock = 0;
    saveProducts();
    displayProducts();
  }
}

// Fungsi untuk mencari produk
function searchProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const productContainer = document.getElementById("productDisplay");
  if (!productContainer) return; // Jangan lanjutkan jika elemen tidak ada

  productContainer.innerHTML = "";

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
  );

  if (filteredProducts.length === 0) {
    productContainer.innerHTML = "<p>Produk tidak ditemukan</p>";
    return;
  }

  filteredProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <h3>${product.name}</h3>
      <p>Kategori: ${product.category}</p>
      <p class="price">Rp ${product.price.toLocaleString("id-ID")}</p>
      <button onclick="addToCart('${product.name}', ${
      product.price
    })">Tambah ke Keranjang</button>
    `;
    productContainer.appendChild(productCard);
  });
}

// Fungsi untuk menambahkan produk baru
function showAddProductModal() {
  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "addProductModal";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Tambah Produk Baru</h2>
      <div class="form-group">
        <label for="productName">Nama Produk:</label>
        <input type="text" id="productName" placeholder="Nama Produk">
      </div>
      <div class="form-group">
        <label for="productCategory">Kategori:</label>
        <select id="productCategory">
          <option value="Pakaian">Pakaian</option>
          <option value="Sepatu">Sepatu</option>
          <option value="Aksesoris">Aksesoris</option>
        </select>
      </div>
      <div class="form-group">
        <label for="productPrice">Harga (Rp):</label>
        <input type="number" id="productPrice" placeholder="Harga">
      </div>
      <div class="button-group">
        <button onclick="saveNewProduct()">Simpan</button>
        <button onclick="closeAddProductModal()">Batal</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Fungsi untuk menutup modal tambah produk
function closeAddProductModal() {
  const modal = document.getElementById("addProductModal");
  if (modal) {
    document.body.removeChild(modal);
  }
}

// Fungsi untuk menyimpan produk baru
function saveNewProduct() {
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = parseInt(document.getElementById("productPrice").value);

  if (!name || isNaN(price) || price <= 0) {
    alert("Mohon isi semua data dengan benar!");
    return;
  }

  const newId =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    name: name,
    category: category,
    price: price,
  };

  products.push(newProduct);
  saveProducts();
  closeAddProductModal();
  displayProducts();
  alert("Produk baru berhasil ditambahkan!");
}

// Fungsi untuk memfilter produk berdasarkan kategori
function filterByCategory() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const productContainer = document.getElementById("productDisplay");
  if (!productContainer) return; // Jangan lanjutkan jika elemen tidak ada

  productContainer.innerHTML = "";

  let filteredProducts = products;

  // Filter berdasarkan kategori jika dipilih
  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === categoryFilter
    );
  }

  // Filter berdasarkan kata kunci pencarian jika ada
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredProducts.length === 0) {
    productContainer.innerHTML = "<p>Produk tidak ditemukan</p>";
    return;
  }

  filteredProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <h3>${product.name}</h3>
      <p>Kategori: ${product.category}</p>
      <p class="price">Rp ${product.price.toLocaleString("id-ID")}</p>
      <button onclick="addToCart('${product.name}', ${
      product.price
    })">Tambah ke Keranjang</button>
    `;
    productContainer.appendChild(productCard);
  });
}

// Modifikasi addToCart untuk menggunakan produk dari array
//function addToCart(name, price) {
// const item = cart.find((i) => i.name === name);
//if (item) {
//item.qty++;
//} else {
// cart.push({ name, price, qty: 1 });
//}
//updateCart();

// Setelah menambahkan ke keranjang, pindah ke bagian transaksi
//showTransaksiSection();
//}

// Fungsi untuk menampilkan bagian transaksi
function showTransaksiSection() {
  document.querySelector(".dashboard").style.display = "none";
  document.querySelector(".product-list").style.display = "none"; // SEMBUNYIKAN PRODUK DI TRANSAKSI
  document.querySelector(".cart").style.display = "block";
  document.querySelector(".laporan").style.display = "none";

  const menuItems = document.querySelectorAll(".nav-link");
  menuItems.forEach((item, index) => {
    item.classList.remove("active");
    if (index === 1) item.classList.add("active");
  });
}

// Fungsi untuk menyimpan dan memuat data penjualan
function loadSalesData() {
  const storedSalesData = localStorage.getItem("salesData");
  if (storedSalesData) {
    salesData = JSON.parse(storedSalesData);
    updateSalesReport();
  }
}

// Inisialisasi ketika DOM selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Navigasi utama
  document.querySelectorAll(".nav-link").forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(".dashboard").style.display = "none";
      document.querySelector(".product-list").style.display = "none";
      document.querySelector(".cart").style.display = "none";
      document.querySelector(".laporan").style.display = "none";

      if (index === 0) {
        document.querySelector(".dashboard").style.display = "block";
        displayProducts();
      } else if (index === 1) {
        document.querySelector(".cart").style.display = "block"; // Produk tidak ditampilkan
      } else if (index === 2) {
        document.querySelector(".laporan").style.display = "block";
      }

      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
  // Load produk dari localStorage
  loadProducts();

  // Tambahkan event listener untuk pencarian real-time
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
  }

  // Tambahkan event listener untuk menu navigasi
  document.querySelectorAll(".nav-link").forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Sembunyikan semua section
      document.querySelector(".dashboard").style.display = "none";
      document.querySelector(".product-list").style.display = "none";
      document.querySelector(".cart").style.display = "none";
      document.querySelector(".laporan").style.display = "none";

      // Tampilkan section sesuai menu yang dipilih
      if (index === 0) {
        // Dashboard
        document.querySelector(".dashboard").style.display = "block";
        displayProducts(); // Update tampilan produk hanya saat di dashboard
      } else if (index === 1) {
        // Transaksi
        document.querySelector(".cart").style.display = "block";
      } else if (index === 2) {
        // Laporan
        document.querySelector(".laporan").style.display = "block";
      }

      // Update menu aktif
      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
  // Sembunyikan elemen produk di luar dashboard jika ada
  const productListSection = document.querySelector(".product-list");
  if (productListSection) {
    productListSection.style.display = "none";
  }

  // Tampilkan dashboard secara default
  document.querySelector(".dashboard").style.display = "block";
  document.querySelector(".cart").style.display = "none";
  document.querySelector(".laporan").style.display = "none";

  // Tampilkan produk di dashboard
  displayProducts();

  // Load data penjualan dari localStorage
  loadSalesData();
});
