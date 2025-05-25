<?php
require_once 'koneksi.php'; // File koneksi database

// Query untuk mendapatkan semua kategori
$categoryQuery = "SELECT * FROM categories ORDER BY name";
$categoryResult = $conn->query($categoryQuery);

// Query untuk mendapatkan semua produk
$productQuery = "SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id
                ORDER BY p.name";
$productResult = $conn->query($productQuery);
?>
<?php
// Start session
session_start();

// Check if user is already logged in
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header("Location: index.php");
    exit;
}
?>


<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kasir Butik Alratz Official</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
    <script src="demo.js"></script>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Kasir</h2>
          <p>Butik Alratz</p>
        </div>
        <ul class="nav-menu">
          <li><a href="#" class="nav-link">Dashboard</a></li>
          <li><a href="#" class="nav-link">Transaksi</a></li>
          <li><a href="#" class="nav-link">Laporan</a></li>
          <div class="logout-container">
            <a href="#" class="logout-link" onclick="logout()">Logout</a>
          </div>
        </ul>
      </div>
      <div class="main-content">
        <div class="main-content">
          <!-- DASHBOARD -->
          <div class="dashboard section">
            <h1>Transaksi Baru</h1>
            <input type="text" id="searchInput" placeholder="Cari produk..." />
            <button onclick="addProduct()">Cari Produk</button>
            <div class="product-list">
          </div>

          <div class="dashboard-controls">
            
            <select id="categoryFilter" onchange="filterByCategory()">
              <option value="">Semua Kategori</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Sepatu">Sepatu</option>
              <option value="Aksesoris">Aksesoris</option>
            </select>
            <button onclick="showAddProductModal()">Tambah Produk Baru</button>
          </div>
        
          <div class="product-display" id="productDisplay">
            <!-- Produk akan ditampilkan di sini melalui JavaScript -->
          </div>
        </div>

          <!-- TRANSAKSI -->
          <div class="transaksi section">        
              <div id="productContainer"></div>
            </div>
            <div class="cart">
              <h2>Keranjang</h2>
              <table id="cartTable">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
              <h3>Total: Rp <span id="totalAmount">0</span></h3>
              <button onclick="showModal()">Bayar</button>
            </div>
          </div>

          <!-- LAPORAN -->
          <div class="laporan section" style="display: none">
            <h2>Laporan Penjualan</h2>
            <div class="filter-controls">
              <input type="date" id="startDate" />
              <input type="date" id="endDate" />
              <button onclick="filterSales()">Filter</button>
              <button onclick="resetFilter()">Reset</button>
            </div>

            <div class="summary-cards">
              <div class="summary-card">
                <h3>Total Transaksi</h3>
                <p id="totalTransactions">0</p>
              </div>
              <div class="summary-card">
                <h3>Total Pendapatan</h3>
                <p>Rp <span id="totalRevenue">0</span></p>
              </div>
              <div class="summary-card">
                <h3>Rata-rata Transaksi</h3>
                <p>Rp <span id="averageTransaction">0</span></p>
              </div>
            </div>

            <div class="sales-table">
              <h3>Riwayat Transaksi</h3>
              <table id="salesTable">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Tunai</th>
                    <th>Kembalian</th>
                  </tr>
                </thead>
                <tbody id="salesTableBody"></tbody>
              </table>
            </div>
          </div>
          <div class="modal" id="receiptModal">
            <div class="modal-content">
              <h2>Struk Pembayaran</h2>
              <div id="receiptContent"></div>
              <div class="receipt-actions" style="margin-top: 20px">
                <!-- Input nomor WhatsApp pelanggan -->
                <div class="whatsapp-section" style="margin-bottom: 15px">
                  <label for="customerPhone">Nomor WhatsApp Pelanggan:</label>
                  <input
                    type="text"
                    id="customerPhone"
                    placeholder="Contoh: 628123456789"
                    style="width: 100%"
                  />
                </div>

                <!-- Tombol-tombol aksi -->
                <div class="button-group" style="display: flex; gap: 10px">
                  <button onclick="printReceipt()">
                    <i class="fas fa-print"></i> Cetak Struk
                  </button>
                  <button onclick="sendToWhatsApp()">
                    <i class="fab fa-whatsapp"></i> Kirim via WhatsApp
                  </button>
                  <button onclick="closeReceipt()">Tutup</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Pembayaran -->
          <div class="modal" id="paymentModal">
            <div class="modal-content">
              <h2>Pembayaran</h2>
              <p>Total Bayar: Rp <span id="modalTotal">0</span></p>

              <!-- Pilihan metode pembayaran -->
              <div class="payment-options">
                <div class="payment-option">
                  <input
                    type="radio"
                    id="cashPayment"
                    name="paymentMethod"
                    value="cash"
                    checked
                  />
                  <label for="cashPayment">Tunai</label>
                </div>
                <div class="payment-option">
                  <input
                    type="radio"
                    id="qrPayment"
                    name="paymentMethod"
                    value="qr"
                  />
                  <label for="qrPayment">Transfer (QR BNI)</label>
                </div>
              </div>

              <!-- Form pembayaran tunai -->
              <div id="cashPaymentForm">
                <input type="number" id="cashInput" placeholder="Uang Tunai" />
                <p>Kembalian: Rp <span id="changeAmount">0</span></p>
              </div>

              <!-- Form pembayaran QR -->
              <div id="qrPaymentForm" style="display: none">
                <div class="qr-container">
                  <img
                    src="c:\Users\User\Downloads\qr bni.jpg"
                    height="200px"
                    width="200px"
                    alt="QR Code BNI"
                    id="qrCodeBNI"
                  />
                  <p>Scan QR code di atas menggunakan aplikasi BNI Mobile</p>
                  <p>No. Rekening: 123456789</p>
                  <p>a.n. Butik Alratz</p>
                </div>
                <div class="payment-confirmation">
                  <label for="paymentReference"
                    >Masukkan Nomor Referensi Pembayaran:</label
                  >
                  <input
                    type="text"
                    id="paymentReference"
                    placeholder="Contoh: BNI123456789"
                  />
                </div>
              </div>
              <button onclick="processPayment()">Bayar Sekarang</button>
              <button onclick="closeModal()">Batal</button>
            </div>
          </div>
          <!-- Modal Struk -->
          <div class="modal" id="receiptModal">
            <div class="modal-content">
              <h2>Struk Pembayaran</h2>
              <div id="receiptContent"></div>
              <button onclick="closeReceipt()">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Tambahkan modal konfirmasi logout ke akhir body -->
    <div class="modal" id="logoutModal">
      <div class="modal-content">
        <h2>Konfirmasi Logout</h2>
        <p>Apakah Anda yakin ingin keluar dari sistem?</p>
        <div class="button-group">
          <button onclick="confirmLogout()">Ya, Keluar</button>
          <button onclick="closeLogoutModal()">Batal</button>
        </div>
      </div>
    </div>
  </body>
</html>
