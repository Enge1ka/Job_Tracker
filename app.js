// --- DATA STORAGE & INITIALIZATION ---
let jobEntries = JSON.parse(localStorage.getItem('jobEntries')) || [];
let companyList = JSON.parse(localStorage.getItem('companyList')) || [];
let categoryList = JSON.parse(localStorage.getItem('categoryList')) || []; // Used by employee, managed by admin

// Logged-in user's email (assuming auth.js sets this in sessionStorage)
const currentUserEmail = sessionStorage.getItem('loggedInUserEmail');

// Save functions
function saveJobEntries() {
    localStorage.setItem('jobEntries', JSON.stringify(jobEntries));
}

function saveCompanyList() {
    localStorage.setItem('companyList', JSON.stringify(companyList));
}

// This global saveCategoryList is used if categoryList is modified directly by non-admin functions
function saveGlobalCategoryList() { 
    localStorage.setItem('categoryList', JSON.stringify(categoryList));
}

// Initialize with some default data if lists are empty
function initializeDefaultLists() {
    if (companyList.length === 0) {
        companyList = ['Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Acme Corp'];
        saveCompanyList();
    }
    // categoryList will be initialized by adminGetCategoryList if empty, or use existing from localStorage
}

// Call initialization
initializeDefaultLists();


// --- EMPLOYEE DASHBOARD SPECIFIC FUNCTIONS ---
function populateEmployeeFormDefaults() {
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
        // Load categories from the global categoryList (which is kept in sync by admin functions)
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

function renderJobEntriesTable() {
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

function handleJobEntrySubmit(event) {
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
        userEmail: currentUserEmail, date, companyName, category, description, timeSpent, location, supportContract
    };
    jobEntries.push(newEntry);
    saveJobEntries();
    renderJobEntriesTable();
    displayJobEntryMessage('Job entry added successfully!', 'success-message');
    document.getElementById('jobEntryForm').reset(); 
}

function displayJobEntryMessage(message, typeClass) {
    const messageElement = document.getElementById('jobEntryMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = typeClass; 
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    }
}

// --- ADMIN DASHBOARD SPECIFIC FUNCTIONS ---
// User Management Section
let userManagementList = []; 

function adminGetUserList() {
    const storedUsers = localStorage.getItem('userManagementList');
    if (storedUsers) {
        userManagementList = JSON.parse(storedUsers);
    } else if (typeof window.getInitialAuthUsers === 'function') {
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

function adminSaveUserList() {
    localStorage.setItem('userManagementList', JSON.stringify(userManagementList));
}

function renderUserManagementTable() {
    const tableBody = document.getElementById('userManagementTable')?.querySelector('tbody');
    if (!tableBody) { return; }
    tableBody.innerHTML = ''; 
    adminGetUserList(); 

    if (userManagementList.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4; 
        cell.textContent = 'No users found in the management list.';
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
window.adminToggleUserStatus = adminToggleUserStatus; 

function handleCreateUserFormSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!email || !password || !role) {
        displayCreateUserMessage("All fields are required.", "error-message");
        return;
    }
    if (userManagementList.some(user => user.email === email)) {
        displayCreateUserMessage("Email already exists.", "error-message");
        return;
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
        messageElement.textContent = message;
        messageElement.className = typeClass;
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    }
}
// End of User Management Section

// Category Management Section
let adminCategories = []; // Local cache for categories on admin page

function adminGetCategoryList() {
    const storedCategories = localStorage.getItem('categoryList'); 
    if (storedCategories) {
        adminCategories = JSON.parse(storedCategories);
    } else {
        adminCategories = ['Consulting', 'Development', 'Meeting', 'Support Call', 'Project Management', 'Training', 'Documentation', 'General Admin'];
        adminSaveCategoryList(); 
    }
    categoryList = [...adminCategories]; // Keep global categoryList in sync
    return adminCategories;
}

function adminSaveCategoryList() {
    localStorage.setItem('categoryList', JSON.stringify(adminCategories));
    categoryList = [...adminCategories]; // Ensure global list is also updated
    // No need to call saveGlobalCategoryList if adminCategories is the source of truth for 'categoryList' key
}

function renderCategoryList() {
    const listDisplay = document.getElementById('categoryListDisplay');
    if (!listDisplay) { return; }
    listDisplay.innerHTML = ''; 
    adminGetCategoryList(); 

    if (adminCategories.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No categories defined yet.';
        listDisplay.appendChild(listItem);
        return;
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
        populateEmployeeFormDefaults(); // Ensure employee dropdown is updated
    }
    displayCategoryMessage(`Category "${categoryName}" deleted.`, 'success-message');
}
window.adminDeleteCategory = adminDeleteCategory; 

function displayCategoryMessage(message, typeClass) {
    const messageElement = document.getElementById('categoryMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = typeClass; 
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    }
}

function handleCreateCategoryFormSubmit(event) {
    event.preventDefault();
    const newCategoryName = document.getElementById('newCategoryName').value.trim();
    if (!newCategoryName) {
        displayCategoryMessage("Category name cannot be empty.", "error-message");
        return;
    }
    if (adminCategories.includes(newCategoryName)) {
        displayCategoryMessage("Category already exists.", "error-message");
        return;
    }
    adminCategories.push(newCategoryName);
    adminSaveCategoryList();
    renderCategoryList();
    if (typeof populateEmployeeFormDefaults === 'function' && document.getElementById('jobCategory')) {
        populateEmployeeFormDefaults(); // Ensure employee dropdown is updated
    }
    displayCategoryMessage("Category added successfully!", "success-message");
    document.getElementById('createCategoryForm').reset();
}
// End of Category Management Section

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Employee Dashboard
    if (document.getElementById('jobEntryForm')) {
        populateEmployeeFormDefaults();
        renderJobEntriesTable();
        const jobEntryForm = document.getElementById('jobEntryForm');
        jobEntryForm.addEventListener('submit', handleJobEntrySubmit);
    } 
    // Admin Dashboard
    else if (document.getElementById('userManagementTable')) { 
        console.log("Admin dashboard detected.");
        adminGetUserList(); 
        renderUserManagementTable();
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', handleCreateUserFormSubmit);
        }

        // Initialize Category Management if its elements are present
        if (document.getElementById('categoryListDisplay')) {
            adminGetCategoryList();
            renderCategoryList();
            const createCategoryForm = document.getElementById('createCategoryForm');
            if (createCategoryForm) {
                createCategoryForm.addEventListener('submit', handleCreateCategoryFormSubmit);
            }
        }
    }
});

console.log("app.js loaded");
