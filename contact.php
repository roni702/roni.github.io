<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    
    $to = "ronymurad50@gmail.com";
    $subject = "Nieuw contactformulier bericht";
    $body = "Naam: $name\nE-mail: $email\n\nBericht:\n$message";
    $headers = "From: $email";
    
    if (mail($to, $subject, $body, $headers)) {
        echo "E-mail succesvol verzonden.";
    } else {
        echo "Er is een fout opgetreden bij het verzenden van de e-mail.";
    }
}
?>
