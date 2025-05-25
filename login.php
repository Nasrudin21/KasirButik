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
    <title>Login Kasir Butik Alratz</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
    <script src="demo.js"></script>
    <link rel="stylesheet" href="logn.css" />
  </head>
  <body>
    <div class="login-container">
      <h2>Login Kasir</h2>
      <div class="form-group">
        <input type="text" id="username" placeholder="Username" />
      </div>
      <div class="form-group">
        <input type="password" id="password" placeholder="Password" />
      </div>
      <button onclick="handleLogin()">Login</button>
    </div>
    <script>
      document.getElementById("customerPhone").value = "";

      document.getElementById("receiptModal").classList.add("show");

      // Simpan salinan keranjang sebelum mengosongkannya
      const tempCart = [...cart];
      cart = [];
      updateCart();
      function handleLogin() {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Validasi sederhana
        if (username && password) {
          // Simulasi login berhasil, redirect ke dashboard
          window.location.href = "index.php";
        } else {
          alert("Harap isi username dan password.");
        }
      }
    </script>
  </body>
</html>
