// --- DATA STORAGE & INITIALIZATION ---
let jobEntries = JSON.parse(localStorage.getItem('jobEntries')) || [];
let companyList = JSON.parse(localStorage.getItem('companyList')) || [];
let categoryList = JSON.parse(localStorage.getItem('categoryList')) || []; 

const currentUserEmail = sessionStorage.getItem('loggedInUserEmail');

// Save functions
function saveJobEntries() {
    localStorage.setItem('jobEntries', JSON.stringify(jobEntries));
}
function saveCompanyList() {
    localStorage.setItem('companyList', JSON.stringify(companyList));
}
function saveGlobalCategoryList() { 
    localStorage.setItem('categoryList', JSON.stringify(categoryList));
}
function initializeDefaultLists() {
    if (companyList.length === 0) {
        companyList = ['Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Acme Corp'];
        saveCompanyList();
    }
}
initializeDefaultLists();

// --- COMMON UI HELPER FUNCTIONS ---
function setupChangePasswordModal() {
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm'); 
    const changePasswordMessage = document.getElementById('changePasswordMessage'); 

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const oldPassword = document.getElementById('oldPassword').value; 
            const newPassword = document.getElementById('newModalPassword').value; 
            const confirmNewPassword = document.getElementById('confirmNewModalPassword').value; 
            const messageElem = changePasswordMessage || document.createElement('p'); 
            if (!changePasswordMessage && changePasswordForm.contains(messageElem)) {
                 changePasswordForm.appendChild(messageElem);
            }
            if (newPassword !== confirmNewPassword) {
                messageElem.textContent = "New passwords do not match.";
                messageElem.className = 'error-message';
                messageElem.style.display = 'block';
                return;
            }
            const success = window.changePassword(oldPassword, newPassword, confirmNewPassword); 
            if (success) {
                messageElem.textContent = "Password changed successfully! Modal will close.";
                messageElem.className = 'success-message';
                messageElem.style.display = 'block';
                changePasswordForm.reset();
                setTimeout(() => {
                    if (typeof closeChangePasswordModal === "function") closeChangePasswordModal(); 
                    else if(changePasswordModal) changePasswordModal.style.display = 'none';
                    messageElem.style.display = 'none';
                }, 2000);
            } 
        });
    }
    window.openChangePasswordModal = function() {
        if(changePasswordModal) {
            changePasswordModal.style.display = 'flex';
            document.getElementById('oldPassword')?.focus();
        }
    };
    window.closeChangePasswordModal = function() {
        if(changePasswordModal) {
            changePasswordModal.style.display = 'none';
            if(changePasswordForm) changePasswordForm.reset();
            if(changePasswordMessage) changePasswordMessage.style.display = 'none';
        }
    };
}

// --- EMPLOYEE DASHBOARD SPECIFIC FUNCTIONS ---
function populateEmployeeFormDefaults() { /* Full implementation from previous steps */ 
    const companySuggestions = document.getElementById('companySuggestions');
    if (companySuggestions) {
        companySuggestions.innerHTML = ''; 
        companyList.forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            companySuggestions.appendChild(option);
        });
    }
    const jobCategorySelect = document.getElementById('jobCategory');
    if (jobCategorySelect) {
        const currentGlobalCategories = JSON.parse(localStorage.getItem('categoryList')) || [];
        jobCategorySelect.innerHTML = '<option value="">Select Category</option>'; 
        currentGlobalCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            jobCategorySelect.appendChild(option);
        });
    }
}
function renderJobEntriesTable() { /* Full implementation from previous steps */ 
    const tableBody = document.getElementById('jobEntriesTable')?.querySelector('tbody');
    if (!tableBody) { return; }
    tableBody.innerHTML = ''; 
    const userJobEntries = jobEntries.filter(entry => !entry.userEmail || entry.userEmail === currentUserEmail);
    if (userJobEntries.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 8; 
        cell.textContent = 'No job entries recorded yet.';
        cell.style.textAlign = 'center';
        return;
    }
    userJobEntries.forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = entry.date;
        row.insertCell().textContent = entry.companyName;
        row.insertCell().textContent = entry.category;
        const descriptionCell = row.insertCell();
        descriptionCell.textContent = entry.description.length > 50 ? entry.description.substring(0, 47) + '...' : entry.description;
        descriptionCell.title = entry.description; 
        row.insertCell().textContent = entry.timeSpent;
        row.insertCell().textContent = entry.location;
        row.insertCell().textContent = entry.supportContract;
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `<button onclick="editJobEntry('${entry.id}')">Edit</button> <button onclick="deleteJobEntry('${entry.id}')">Delete</button>`;
    });
}
function editJobEntry(entryId) { alert(`Edit functionality for entry ID ${entryId} is not implemented yet.`); }
function deleteJobEntry(entryId) { alert(`Delete functionality for entry ID ${entryId} is not implemented yet.`); }
function handleJobEntrySubmit(event) { /* Full implementation from previous steps */ 
    event.preventDefault(); 
    const date = document.getElementById('jobDate').value;
    const companyName = document.getElementById('jobCompanyName').value.trim();
    const category = document.getElementById('jobCategory').value;
    const description = document.getElementById('jobDescription').value.trim();
    const timeSpent = parseFloat(document.getElementById('jobTimeSpent').value);
    const location = document.getElementById('jobLocation').value;
    const supportContract = document.getElementById('jobSupportContract').value;
    if (!date || !companyName || !category || !description || isNaN(timeSpent) || timeSpent <= 0 || !location || !supportContract) {
        displayJobEntryMessage('Please fill in all fields correctly.', 'error-message');
        return;
    }
    if (!companyList.includes(companyName)) {
        companyList.push(companyName);
        saveCompanyList();
        populateEmployeeFormDefaults(); 
    }
    const newEntry = {
        id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), 
        userEmail: currentUserEmail, date, companyName, category, description, timeSpent, location, supportContract,
        invoiceNumber: '', invoiceValue: null, amountPayable: null // Initialize new account fields
    };
    jobEntries.push(newEntry);
    saveJobEntries();
    renderJobEntriesTable();
    displayJobEntryMessage('Job entry added successfully!', 'success-message');
    document.getElementById('jobEntryForm').reset(); 
}
function displayJobEntryMessage(message, typeClass) { /* Full implementation from previous steps */ 
    const messageElement = document.getElementById('jobEntryMessage'); 
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = typeClass; 
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    }
}

// --- ADMIN DASHBOARD SPECIFIC FUNCTIONS ---
// (User Management, Category Management, Overview, View Employee Jobs - Full implementations from previous steps)
let userManagementList = []; 
function adminGetUserList() { /* ... */ }
function adminSaveUserList() { /* ... */ }
function renderUserManagementTable() { /* ... */ }
function adminToggleUserStatus(userId) { /* ... */ }
window.adminToggleUserStatus = adminToggleUserStatus; 
function handleCreateUserFormSubmit(event) { /* ... */ }
function displayCreateUserMessage(message, typeClass) { /* ... */ }
let adminCategories = []; 
function adminGetCategoryList() { /* ... */ }
function adminSaveCategoryList() { /* ... */ }
function renderCategoryList() { /* ... */ }
function adminDeleteCategory(categoryName) { /* ... */ }
window.adminDeleteCategory = adminDeleteCategory; 
function displayCategoryMessage(message, typeClass) { /* ... */ }
function handleCreateCategoryFormSubmit(event) { /* ... */ }
function displayRecentActivitySnippets() { /* ... */ }
function displayEmployeeSpecificJobs() { /* ... */ }

// --- ACCOUNTS DASHBOARD FUNCTIONS ---
function displayAllJobEntries_Accounts() {
    const tableBody = document.getElementById('allJobEntriesTable_Accounts')?.querySelector('tbody');
    const messageElement = document.getElementById('accountsJobEntriesMessage');
    if (!tableBody || !messageElement) { return; }

    const allJobEntries = JSON.parse(localStorage.getItem('jobEntries')) || [];
    jobEntries = allJobEntries; // Update global jobEntries if fetched directly for modification
    tableBody.innerHTML = '';

    if (allJobEntries.length === 0) {
        messageElement.textContent = 'No job entries found.';
        messageElement.className = 'message';
        messageElement.style.display = 'block';
        return;
    }
    messageElement.style.display = 'none';
    allJobEntries.forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = entry.date;
        row.insertCell().textContent = entry.userEmail || 'N/A';
        row.insertCell().textContent = entry.companyName;
        row.insertCell().textContent = entry.category;
        row.insertCell().textContent = entry.description;
        row.insertCell().textContent = entry.timeSpent;
        row.insertCell().textContent = entry.location;
        row.insertCell().textContent = entry.supportContract;
        
        // Invoice Number
        const invoiceNumCell = row.insertCell();
        const invoiceNumInput = document.createElement('input');
        invoiceNumInput.type = 'text';
        invoiceNumInput.className = 'invoice-number-input';
        invoiceNumInput.value = entry.invoiceNumber || '';
        invoiceNumInput.setAttribute('data-job-id', entry.id);
        invoiceNumCell.appendChild(invoiceNumInput);

        // Invoice Value
        const invoiceValCell = row.insertCell();
        const invoiceValInput = document.createElement('input');
        invoiceValInput.type = 'number';
        invoiceValInput.step = '0.01';
        invoiceValInput.className = 'invoice-value-input';
        invoiceValInput.value = entry.invoiceValue || '';
        invoiceValInput.setAttribute('data-job-id', entry.id);
        invoiceValCell.appendChild(invoiceValInput);
        
        // Amount Payable
        const amountPayCell = row.insertCell();
        const amountPayInput = document.createElement('input');
        amountPayInput.type = 'number';
        amountPayInput.step = '0.01';
        amountPayInput.className = 'amount-payable-input';
        amountPayInput.value = entry.amountPayable || '';
        amountPayInput.setAttribute('data-job-id', entry.id);
        amountPayCell.appendChild(amountPayInput);

        // Actions
        const actionsCell = row.insertCell();
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'save-account-details-btn';
        saveButton.setAttribute('data-job-id', entry.id);
        actionsCell.appendChild(saveButton);
    });
}

function handleSaveAccountDetailsClick(event) {
    if (!event.target.classList.contains('save-account-details-btn')) {
        return; // Click was not on a save button
    }
    const button = event.target;
    const jobId = button.getAttribute('data-job-id');
    const row = button.closest('tr');

    if (!row) {
        console.error("Could not find row for job ID:", jobId);
        return;
    }

    const invoiceNumber = row.querySelector('.invoice-number-input').value;
    const invoiceValue = parseFloat(row.querySelector('.invoice-value-input').value);
    const amountPayable = parseFloat(row.querySelector('.amount-payable-input').value);

    // Find the job entry in the global jobEntries array
    const jobIndex = jobEntries.findIndex(entry => entry.id === jobId);
    if (jobIndex !== -1) {
        jobEntries[jobIndex].invoiceNumber = invoiceNumber;
        jobEntries[jobIndex].invoiceValue = isNaN(invoiceValue) ? null : invoiceValue;
        jobEntries[jobIndex].amountPayable = isNaN(amountPayable) ? null : amountPayable;
        
        saveJobEntries(); // Save the updated global jobEntries array to localStorage

        // Visual feedback
        button.textContent = 'Saved!';
        button.disabled = true;
        setTimeout(() => {
            button.textContent = 'Save';
            button.disabled = false;
        }, 1500);
    } else {
        console.error("Job entry not found for ID:", jobId);
        alert("Error: Could not save details. Job entry not found.");
    }
}

// --- SALES DASHBOARD FUNCTIONS ---
function displayAllJobEntries_Sales() { /* Full implementation from previous steps */ 
    const tableBody = document.getElementById('allJobEntriesTable_Sales')?.querySelector('tbody');
    const messageElement = document.getElementById('salesJobEntriesMessage');
    if (!tableBody || !messageElement) { return; }

    const allJobEntries = JSON.parse(localStorage.getItem('jobEntries')) || [];
    tableBody.innerHTML = '';

    if (allJobEntries.length === 0) {
        messageElement.textContent = 'No job entries found.';
        messageElement.className = 'message'; 
        messageElement.style.display = 'block';
        return;
    }
    messageElement.style.display = 'none';
    allJobEntries.forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = entry.date;
        row.insertCell().textContent = entry.userEmail || 'N/A';
        row.insertCell().textContent = entry.companyName;
        row.insertCell().textContent = entry.category;
        row.insertCell().textContent = entry.description;
        row.insertCell().textContent = entry.timeSpent;
        row.insertCell().textContent = entry.location;
        row.insertCell().textContent = entry.supportContract;
    });
}


// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup common UI components
    if (document.getElementById('changePasswordModal')) { setupChangePasswordModal(); }
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    if (userEmailDisplay && currentUserEmail) { userEmailDisplay.textContent = currentUserEmail; }

    // Page specific initializations
    if (document.getElementById('jobEntryForm')) { /* Employee */ } 
    else if (document.getElementById('userManagementTable')) { /* Admin User Mgmt */ }
    else if (document.getElementById('categoryListDisplay')) { /* Admin Cat Mgmt */ }
    else if (document.getElementById('activitySnippetsContainer')) { /* Admin Overview */ }
    else if (document.getElementById('employeeSpecificJobTable')) { /* Admin View Emp Jobs */ }
    else if (document.getElementById('allJobEntriesTable_Accounts')) { 
        displayAllJobEntries_Accounts();
        const accountsFilterButton = document.getElementById('applyFilters_Accounts_Button');
        if(accountsFilterButton) accountsFilterButton.addEventListener('click', () => alert("Accounts filter functionality not yet implemented."));
        
        // Event delegation for save buttons
        const accountsTable = document.getElementById('allJobEntriesTable_Accounts');
        if (accountsTable) {
            accountsTable.addEventListener('click', handleSaveAccountDetailsClick);
        }
    }
    else if (document.getElementById('allJobEntriesTable_Sales')) { /* Sales */ }

    // Re-pasting full content of functions that were stubbed above for brevity in the overwrite command
    // Employee Dashboard
    if (document.getElementById('jobEntryForm')) {
        populateEmployeeFormDefaults();
        renderJobEntriesTable();
        document.getElementById('jobEntryForm').addEventListener('submit', handleJobEntrySubmit);
    } 
    // Admin User Management Page
    else if (document.getElementById('userManagementTable')) { 
        adminGetUserList(); renderUserManagementTable();
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) createUserForm.addEventListener('submit', handleCreateUserFormSubmit);
    }
    // Admin Category Management Page
    else if (document.getElementById('categoryListDisplay')) {
        adminGetCategoryList(); renderCategoryList();
        const createCategoryForm = document.getElementById('createCategoryForm');
        if (createCategoryForm) createCategoryForm.addEventListener('submit', handleCreateCategoryFormSubmit);
    }
    // Admin Overview Dashboard
    else if (document.getElementById('activitySnippetsContainer')) {
        displayRecentActivitySnippets();
    }
    // Admin View Employee Specific Jobs Page
    else if (document.getElementById('employeeSpecificJobTable')) {
        displayEmployeeSpecificJobs();
    }
    // Sales Dashboard (already has its init logic above)
    else if (document.getElementById('allJobEntriesTable_Sales')) {
        displayAllJobEntries_Sales();
        const salesFilterButton = document.getElementById('applyFilters_Sales_Button');
        if(salesFilterButton) salesFilterButton.addEventListener('click', () => alert("Sales filter functionality not yet implemented."));
    }
});
// (Full admin function implementations would be here in the actual file)
function adminGetUserList() { /* ... full ... */ 
    const storedUsers = localStorage.getItem('userManagementList');
    if (storedUsers) { userManagementList = JSON.parse(storedUsers); } 
    else if (typeof window.getInitialAuthUsers === 'function') {
        userManagementList = window.getInitialAuthUsers().map((user, index) => ({
            ...user, id: user.id || `user_${Date.now()}_${index}`, isActive: typeof user.isActive === 'undefined' ? true : user.isActive
        }));
        adminSaveUserList(); 
    } else { 
        userManagementList = [
            { id: 'admin_fallback_1', email: 'admin@example.com', password: 'adminpass', role: 'admin', isActive: true, pin: '0000' },
            { id: 'emp_fallback_1', email: 'employee@example.com', password: 'password123', role: 'employee', isActive: true, pin: '1111'}
        ];
        adminSaveUserList();
     }
    return userManagementList;
}
function adminSaveUserList() { localStorage.setItem('userManagementList', JSON.stringify(userManagementList)); }
function renderUserManagementTable() {
    const tableBody = document.getElementById('userManagementTable')?.querySelector('tbody');
    if (!tableBody) { return; } 
    tableBody.innerHTML = ''; adminGetUserList(); 
    if (userManagementList.length === 0) { 
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4; 
        cell.textContent = 'No users found.';
        cell.style.textAlign = 'center';
        return;
     }
    userManagementList.forEach(user => { 
        const row = tableBody.insertRow();
        row.insertCell().textContent = user.email;
        row.insertCell().textContent = user.role;
        row.insertCell().textContent = user.isActive ? 'Active' : 'Deactivated';
        const actionsCell = row.insertCell();
        const toggleButton = document.createElement('button');
        toggleButton.textContent = user.isActive ? 'Deactivate' : 'Activate';
        toggleButton.setAttribute('onclick', `adminToggleUserStatus('${user.id}')`);
        actionsCell.appendChild(toggleButton);
     });
}
function adminToggleUserStatus(userId) { 
    const user = userManagementList.find(u => u.id === userId);
    if (user) {
        const loggedInAdminEmail = sessionStorage.getItem('loggedInUserEmail');
        if (user.email === loggedInAdminEmail && user.role === 'admin') {
            const activeAdmins = userManagementList.filter(u => u.role === 'admin' && u.isActive && u.id !== userId);
            if (activeAdmins.length === 0 && user.isActive) { 
                alert("Cannot deactivate the only active admin account.");
                return;
            }
        }
        user.isActive = !user.isActive;
        adminSaveUserList();
        renderUserManagementTable();
    }
 }
// window.adminToggleUserStatus = adminToggleUserStatus; 
function handleCreateUserFormSubmit(event) { 
    event.preventDefault();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    if (!email || !password || !role) {
        displayCreateUserMessage("All fields are required.", "error-message"); return;
    }
    if (userManagementList.some(user => user.email === email)) {
        displayCreateUserMessage("Email already exists.", "error-message"); return;
    }
    const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        email, password, role, isActive: true, pin: String(Math.floor(1000 + Math.random() * 9000))
    };
    userManagementList.push(newUser);
    adminSaveUserList();
    renderUserManagementTable();
    displayCreateUserMessage("User created successfully!", "success-message");
    document.getElementById('createUserForm').reset();
 }
function displayCreateUserMessage(message, typeClass) { 
    const messageElement = document.getElementById('createUserMessage');
    if (messageElement) {
        messageElement.textContent = message; messageElement.className = typeClass;
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    }
 }
function adminGetCategoryList() { 
    const storedCategories = localStorage.getItem('categoryList'); 
    if (storedCategories) {
        adminCategories = JSON.parse(storedCategories);
    } else {
        adminCategories = ['Consulting', 'Development', 'Meeting', 'Support Call', 'Project Management', 'Training', 'Documentation', 'General Admin'];
        adminSaveCategoryList(); 
    }
    categoryList = [...adminCategories]; 
    return adminCategories;
 }
function adminSaveCategoryList() {
    localStorage.setItem('categoryList', JSON.stringify(adminCategories));
    categoryList = [...adminCategories]; 
}
function renderCategoryList() { 
    const listDisplay = document.getElementById('categoryListDisplay');
    if (!listDisplay) { return; } 
    listDisplay.innerHTML = ''; 
    adminGetCategoryList(); 
    if (adminCategories.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No categories defined yet.';
        listDisplay.appendChild(listItem); return;
    }
    adminCategories.forEach(categoryName => {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '5px'; listItem.style.padding = '5px';
        listItem.style.border = '1px solid #444'; listItem.style.borderRadius = '3px';
        listItem.style.display = 'flex'; listItem.style.justifyContent = 'space-between';
        listItem.style.alignItems = 'center';
        const textSpan = document.createElement('span');
        textSpan.textContent = categoryName;
        listItem.appendChild(textSpan);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginLeft = '10px';
        deleteButton.setAttribute('onclick', `adminDeleteCategory('${categoryName}')`);
        listItem.appendChild(deleteButton);
        listDisplay.appendChild(listItem);
    });
 }
function adminDeleteCategory(categoryName) { 
    adminCategories = adminCategories.filter(cat => cat !== categoryName);
    adminSaveCategoryList();
    renderCategoryList(); 
    if (typeof populateEmployeeFormDefaults === 'function' && document.getElementById('jobCategory')) {
        populateEmployeeFormDefaults(); 
    }
    displayCategoryMessage(`Category "${categoryName}" deleted.`, 'success-message');
 }
// window.adminDeleteCategory = adminDeleteCategory; 
function displayCategoryMessage(message, typeClass) { 
    const messageElement = document.getElementById('categoryMessage');
    if (messageElement) {
        messageElement.textContent = message; messageElement.className = typeClass; 
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    }
 }
function handleCreateCategoryFormSubmit(event) { 
    event.preventDefault();
    const newCategoryName = document.getElementById('newCategoryName').value.trim();
    if (!newCategoryName) {
        displayCategoryMessage("Category name cannot be empty.", "error-message"); return;
    }
    if (adminCategories.includes(newCategoryName)) {
        displayCategoryMessage("Category already exists.", "error-message"); return;
    }
    adminCategories.push(newCategoryName);
    adminSaveCategoryList();
    renderCategoryList();
    if (typeof populateEmployeeFormDefaults === 'function' && document.getElementById('jobCategory')) {
        populateEmployeeFormDefaults(); 
    }
    displayCategoryMessage("Category added successfully!", "success-message");
    document.getElementById('createCategoryForm').reset();
 }
function displayRecentActivitySnippets() { 
    const container = document.getElementById('activitySnippetsContainer');
    if (!container) { return; } 

    const allJobEntries = JSON.parse(localStorage.getItem('jobEntries')) || [];
    if (allJobEntries.length === 0) {
        container.innerHTML = "<p>No job entries yet.</p>";
        return;
    }
    const sortedEntries = allJobEntries.sort((a, b) => {
        const idA = parseInt(a.id.split('_')[1]); 
        const idB = parseInt(b.id.split('_')[1]);
        return idB - idA; 
    });
    const recentEntries = sortedEntries.slice(0, 5); 

    if (recentEntries.length === 0) {
        container.innerHTML = "<p>No recent job entries to display.</p>";
        return;
    }
    container.innerHTML = ''; 
    recentEntries.forEach(entry => {
        const snippet = document.createElement('div');
        snippet.className = 'activity-snippet';
        snippet.setAttribute('data-employee-email', entry.userEmail || 'N/A');
        snippet.innerHTML = `
            <h4>${entry.companyName}</h4>
            <p><strong>Date:</strong> ${entry.date}</p>
            <p><strong>Employee:</strong> ${entry.userEmail || 'N/A'}</p>
            <p><strong>Time:</strong> ${entry.timeSpent} hrs</p>
            <p><strong>Category:</strong> ${entry.category}</p>
        `;
        container.appendChild(snippet);
    });

    container.addEventListener('click', function(event) {
        const clickedSnippet = event.target.closest('.activity-snippet');
        if (clickedSnippet) {
            const employeeEmail = clickedSnippet.getAttribute('data-employee-email');
            if (employeeEmail && employeeEmail !== 'N/A') {
                window.location.href = `admin_view_employee_jobs.html?email=${encodeURIComponent(employeeEmail)}`;
            } else {
                alert("Employee email not available for this entry.");
            }
        }
    });
 }
function displayEmployeeSpecificJobs() { 
    const tableBody = document.getElementById('employeeSpecificJobTable')?.querySelector('tbody');
    const emailDisplay = document.getElementById('employeeEmailDisplay');
    const messageElement = document.getElementById('jobEntriesMessage'); 

    if (!tableBody || !emailDisplay || !messageElement) { return; } 

    const params = new URLSearchParams(window.location.search);
    const employeeEmail = params.get('email');

    if (!employeeEmail) {
        emailDisplay.textContent = "N/A";
        messageElement.textContent = "Employee email not provided in URL.";
        messageElement.className = 'error-message';
        messageElement.style.display = 'block';
        tableBody.innerHTML = '';
        return;
    }

    emailDisplay.textContent = decodeURIComponent(employeeEmail);
    const allJobEntries = JSON.parse(localStorage.getItem('jobEntries')) || [];
    const filteredEntries = allJobEntries.filter(entry => entry.userEmail === employeeEmail);

    tableBody.innerHTML = ''; 
    if (filteredEntries.length === 0) {
        messageElement.textContent = `No job entries found for ${decodeURIComponent(employeeEmail)}.`;
        messageElement.className = 'message'; 
        messageElement.style.display = 'block';
        return;
    }
    
    messageElement.style.display = 'none'; 

    filteredEntries.forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = entry.date;
        row.insertCell().textContent = entry.companyName;
        row.insertCell().textContent = entry.category;
        row.insertCell().textContent = entry.description;
        row.insertCell().textContent = entry.timeSpent;
        row.insertCell().textContent = entry.location;
        row.insertCell().textContent = entry.supportContract;
    });
 }
console.log("app.js loaded");
