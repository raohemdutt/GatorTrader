document.getElementById("signupForm").addEventListener("submit", function(event) {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm_password").value;
    var email = document.getElementById("ufemail").value;
    var errorMessage = document.getElementById("error-message");


    if (!email.endsWith("@ufl.edu")) {
        event.preventDefault();
        errorMessage.textContent = "Please use a valid UF email (@ufl.edu)";
        return;
    }


    if (password !== confirmPassword) {
        event.preventDefault();
        errorMessage.textContent = "Passwords do not match!";
    }
});
