// Original hardcoded user data (fallback and initial seed)
const initialUsers = [
    { id: 'user1', email: 'employee@example.com', password: 'password123', role: 'employee', pin: '1234', isActive: true },
    { id: 'user2', email: 'accounts@example.com', password: 'password123', role: 'accounts', pin: '2345', isActive: true },
    { id: 'user3', email: 'sales@example.com', password: 'password123', role: 'sales', pin: '3456', isActive: true },
    { id: 'admin1', email: 'admin@example.com', password: 'adminpass', role: 'admin', pin: '4567', isActive: true }
];

function login(email, password) {
    let userListToAuth = [];
    const storedUserList = localStorage.getItem('userManagementList');

    if (storedUserList) {
        userListToAuth = JSON.parse(storedUserList);
        console.log("Authenticating with localStorage user list.");
    } else {
        console.log("localStorage user list not found. Using initial hardcoded users and saving to localStorage.");
        // Ensure initialUsers have isActive and id if they don't (though added above)
        const processedInitialUsers = initialUsers.map((u, index) => ({
            ...u,
            id: u.id || `initial_user_${index}`, // Ensure ID
            isActive: typeof u.isActive === 'undefined' ? true : u.isActive // Default to active
        }));
        localStorage.setItem('userManagementList', JSON.stringify(processedInitialUsers));
        userListToAuth = processedInitialUsers;
    }

    const user = userListToAuth.find(u => u.email === email && u.password === password);

    if (user) {
        // Check if user is active. If isActive property doesn't exist, treat as active.
        if (typeof user.isActive !== 'undefined' && user.isActive === false) {
            alert('Account is deactivated. Please contact an administrator.');
            return false; // Login failed (deactivated)
        }

        sessionStorage.setItem('loggedInUserEmail', user.email);
        sessionStorage.setItem('loggedInUserRole', user.role);
        
        // Redirect based on role
        switch (user.role) {
            case 'employee':
                window.location.href = 'employee_dashboard.html';
                break;
            case 'accounts':
                window.location.href = 'accounts_dashboard.html';
                break;
            case 'sales':
                window.location.href = 'sales_dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin_dashboard.html';
                break;
            default:
                console.error('Unknown user role:', user.role);
                window.location.href = 'index.html'; 
                break;
        }
        return true; // Login successful
    } else {
        alert('Invalid email or password.');
        return false; // Login failed
    }
}

function logout() {
    sessionStorage.removeItem('loggedInUserEmail');
    sessionStorage.removeItem('loggedInUserRole');
    // Potentially clear other session-related items
    window.location.href = 'index.html';
    console.log("User logged out, session cleared.");
}

function changePassword(oldPassword, newPassword, confirmNewPassword) {
    // In a real app, you'd get the current user's email from sessionStorage
    const currentUserEmail = sessionStorage.getItem('loggedInUserEmail');
    if (!currentUserEmail) {
        alert("No user logged in.");
        return;
    }
    // This is a placeholder.
    // Real implementation would involve:
    // 1. Finding the user in the 'users' array (or backend).
    // 2. Verifying the oldPassword.
    // 3. Validating the newPassword (e.g., length, complexity).
    // 4. Ensuring newPassword and confirmNewPassword match.
    // 5. Updating the password in the 'users' array (or backend).
    console.log(`Attempting to change password for ${currentUserEmail}. Old: ${oldPassword}, New: ${newPassword}, Confirm: ${confirmNewPassword}`);
    alert("Password change functionality is not fully implemented yet. This is a placeholder.");
}

function requestPasswordReset(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        // Simulate sending PIN
        alert(`A PIN has been sent to ${email}. The PIN is ${user.pin}. (This is for testing - in a real app, the PIN would be emailed).`);
        // In a real app, you might store a timestamp or a flag indicating a reset is in progress.
    } else {
        alert("Email address not found.");
    }
}

function resetPasswordWithPin(email, pin, newPassword) {
    const user = users.find(u => u.email === email);
    if (user) {
        if (user.pin === pin) {
            // In a real app, you would hash the newPassword before saving
            // For now, we are not actually changing the hardcoded data for simplicity.
            // If you wanted to: user.password = newPassword;
            alert("Password has been reset successfully. (Simulated - password not actually changed in this version).");
            // Optionally, clear the PIN or mark it as used
            // user.pin = null; // Or generate a new one, or require re-authentication
        } else {
            alert("Invalid PIN.");
        }
    } else {
        alert("Email address not found.");
    }
}

// Make functions globally accessible if not using modules (for simple script includes)
window.login = login;
window.logout = logout;
window.changePassword = changePassword;
window.requestPasswordReset = requestPasswordReset;
window.resetPasswordWithPin = resetPasswordWithPin;
// window.users = users; // Avoid exposing the raw array directly if possible for modification

// Function to get a copy of the initial users for admin panel or other modules
window.getInitialAuthUsers = function() {
    // Return a deep copy to prevent direct modification of the original array
    // Ensures that the admin panel gets the pristine hardcoded list if it needs to initialize.
    return JSON.parse(JSON.stringify(initialUsers));
};
