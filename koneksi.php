<?php
// Konfigurasi database
$host = 'localhost'; // Sesuaikan dengan host database Anda
$user = 'root';      // Sesuaikan dengan username database Anda
$pass = '';          // Sesuaikan dengan password database Anda
$db   = 'butik_alratzzz';

// Buat koneksi
$conn = new mysqli($host, $user, $pass, $db);

// Periksa koneksi
if ($conn->connect_error) {
    die("Koneksi database gagal: " . $conn->connect_error);
}

// Set karakter encoding
$conn->set_charset("utf8");