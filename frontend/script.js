// Base API URL for backend
const API_URL = 'http://localhost:5000/api';

// Array to store all projects (loaded from backend)
let projects = [];

// Variable to track if we're editing (stores project ID)
let editingProjectId = null;

// Variable to store current selected image as base64
let currentImageData = null;

// Wait for page to load completely
document.addEventListener('DOMContentLoaded', function() {
    // Load projects from backend
    loadProjects();
    
    // Set up event listeners
    setupEventListeners();
});

// Function to set up all event listeners
function setupEventListeners() {
    // Add project button
    document.getElementById('addProjectBtn').addEventListener('click', function() {
        openModal();
    });
    
    // Close modal button (X)
    document.querySelector('.close').addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('projectModal');
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Project form submit
    document.getElementById('projectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProject();
    });
    
    // Image file input change - convert to base64 and preview
    document.getElementById('projectImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('אנא בחר קובץ תמונה');
                this.value = '';
                return;
            }
            
            // Read file and convert to base64
            const reader = new FileReader();
            reader.onload = function(event) {
                currentImageData = event.target.result;
                // Show preview
                showImagePreview(currentImageData);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Function to show image preview
function showImagePreview(imageData) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${imageData}" alt="Preview">`;
}

// Function to open modal
function openModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('projectForm');
    const imagePreview = document.getElementById('imagePreview');
    
    // Reset form and image data
    form.reset();
    imagePreview.innerHTML = '';
    currentImageData = null;
    
    // Check if editing existing project
    if (projectId) {
        editingProjectId = projectId;
        modalTitle.textContent = 'עריכת פרויקט';
        
        // Find project and fill form
        const project = projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDesc').value = project.description;
            document.getElementById('projectRating').value = project.rating;
            
            // Show existing image if available
            if (project.image) {
                currentImageData = project.image;
                showImagePreview(project.image);
            }
        }
    } else {
        editingProjectId = null;
        modalTitle.textContent = 'הוספת פרויקט חדש';
    }
    
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    editingProjectId = null;
    currentImageData = null;
}

// Function to save project (create or update) - NOW USES BACKEND
function saveProject() {
    // Get form values
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;
    const rating = parseInt(document.getElementById('projectRating').value);
    
    // Prepare project data
    const projectData = {
        name: name,
        description: description,
        rating: rating,
        image: currentImageData // Can be null if no image
    };
    
    if (editingProjectId) {
        // Update existing project
        updateProjectOnBackend(editingProjectId, projectData);
    } else {
        // Create new project
        createProjectOnBackend(projectData);
    }
}

// Function to create project on backend
function createProjectOnBackend(projectData) {
    fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Project created:', data);
        // Reload projects from backend
        loadProjects();
        // Close modal
        closeModal();
        alert('הפרויקט נוצר בהצלחה!');
    })
    .catch(error => {
        console.error('Error creating project:', error);
        alert('שגיאה ביצירת הפרויקט. וודא שהשרת פועל.');
    });
}

// Function to update project on backend
function updateProjectOnBackend(projectId, projectData) {
    fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Project updated:', data);
        // Reload projects from backend
        loadProjects();
        // Close modal
        closeModal();
        alert('הפרויקט עודכן בהצלחה!');
    })
    .catch(error => {
        console.error('Error updating project:', error);
        alert('שגיאה בעדכון הפרויקט. וודא שהשרת פועל.');
    });
}

// Function to load projects from backend
function loadProjects() {
    fetch(`${API_URL}/projects`)
        .then(response => response.json())
        .then(data => {
            projects = data;
            displayProjects();
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            document.getElementById('projectsGrid').innerHTML = 
                '<div class="empty-state">שגיאה בטעינת הפרויקטים. וודא שהשרת פועל על http://localhost:5000</div>';
        });
}

// Function to display all projects
function displayProjects() {
    const grid = document.getElementById('projectsGrid');
    
    // Clear grid
    grid.innerHTML = '';
    
    // Check if there are no projects
    if (projects.length === 0) {
        grid.innerHTML = '<div class="empty-state">אין פרויקטים עדיין. לחץ על "הוספת פרויקט חדש" כדי להתחיל!</div>';
        return;
    }
    
    // Create card for each project
    projects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
}

// Function to create a project card element
function createProjectCard(project) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Create rating stars
    const stars = '★'.repeat(project.rating) + '☆'.repeat(5 - project.rating);
    
    // Determine image HTML
    let imageHtml;
    if (project.image) {
        imageHtml = `<img src="${project.image}" alt="${project.name}" class="project-image">`;
    } else {
        // Get first letter of project name for placeholder
        const initial = project.name.charAt(0).toUpperCase();
        imageHtml = `<div class="project-image-placeholder">${initial}</div>`;
    }
    
    // Build card HTML
    card.innerHTML = `
        ${imageHtml}
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <div class="project-meta">
            <span class="project-rating">${stars}</span>
        </div>
        <div class="card-actions">
            <button class="btn-edit" onclick="editProject(${project.id})">עריכון פרויקט</button>
            <button class="btn-rate" onclick="increaseRating(${project.id})">+1 דירוג</button>
            <button class="btn-delete" onclick="deleteProject(${project.id})">מחיקה</button>
        </div>
    `;
    
    return card;
}

// Function to edit a project
function editProject(projectId) {
    openModal(projectId);
}

// Function to increase rating - NOW USES BACKEND
function increaseRating(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project && project.rating < 5) {
        project.rating++;
        
        // Update on backend
        const projectData = {
            name: project.name,
            description: project.description,
            rating: project.rating,
            image: project.image
        };
        
        updateProjectOnBackend(projectId, projectData);
    }
}

// Function to delete a project - NOW USES BACKEND
function deleteProject(projectId) {
    // Confirm before deleting
    if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) {
        fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Project deleted:', data);
            // Reload projects from backend
            loadProjects();
            alert('הפרויקט נמחק בהצלחה!');
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            alert('שגיאה במחיקת הפרויקט. וודא שהשרת פועל.');
        });
    }
}
