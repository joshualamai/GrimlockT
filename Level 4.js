// Example of scrambled password for Level 4
let correctPasswordLevel4 = "secure123";
let scrambledPassword = sha256(correctPasswordLevel4).substring(0, 12); // First 12 chars of hashed password
let level4Hints = [
    "Hint 1: The original password has 8 characters.",
    "Hint 2: It contains both numbers and letters.",
    "Hint 3: It starts with an 's' and ends with a number."
];

// Update this function to display the scrambled password and hints
function level4Setup() {
    document.getElementById("scrambled-password").innerHTML = `Level 4: Crack this scrambled password! <br><strong>${scrambledPassword}</strong>`;
    document.getElementById("message").innerHTML = "Hints will appear after each failed attempt!";
}

// Function to verify the Level 4 password
function verifyLevel4Password() {
    let enteredPassword = document.getElementById("password-input").value;

    if (enteredPassword === correctPasswordLevel4) {
        document.getElementById("message").innerHTML = "Congratulations! You've cracked the Level 4 password!";
        advanceToNextLevel();
    } else {
        attemptsLeft--;
        document.getElementById("attempts-left").textContent = attemptsLeft;

        if (attemptsLeft > 0) {
            let hintIndex = 3 - attemptsLeft; // Show hints progressively
            if (hintIndex < level4Hints.length) {
                document.getElementById("message").innerHTML = level4Hints[hintIndex];
            } else {
                document.getElementById("message").innerHTML = "Incorrect password. Try again!";
            }
        } else {
            // Reveal correct password after 3 failed attempts
            document.getElementById("message").innerHTML = `Game Over! The correct password was: ${correctPasswordLevel4}`;
            document.getElementById("password-input").disabled = true;
        }
    }
}

// Ensure that level4Setup is called when the user reaches Level 4
function checkLevelTransition() {
    if (currentLevel === 4) {
        level4Setup();
    }
}
