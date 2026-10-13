
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';

// Projects are restored from localStorage when possible.
let projects = [];
let editingId = null;

function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

function isValidProject(project) {
  return (
    project !== null &&
    typeof project === 'object' &&
    !Array.isArray(project) &&
    typeof project.id === 'string' &&
    project.id.trim() !== '' &&
    typeof project.name === 'string' &&
    project.name.trim() !== '' &&
    typeof project.status === 'string' &&
    ['Planned', 'In Progress', 'Completed'].includes(project.status)
  );
}

function loadProjects() {
  let storedData;

  try {
    storedData = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    showMessage(
      'Could not read saved projects from browser storage. ' +
      'Changes may not be saved.'
    );
    return;
  }

  // A missing key means this is a new, empty tracker.
  if (storedData === null) {
    projects = [];
    return;
  }

  try {
    const parsedData = JSON.parse(storedData);

    // Validate the entire collection before restoring it.
    if (
      !Array.isArray(parsedData) ||
      !parsedData.every(isValidProject)
    ) {
      showMessage(
        'Saved project data is invalid or malformed. ' +
        'The stored data has been left unchanged. ' +
        'Check or clear the browser storage before continuing.'
      );
      return;
    }

    // IDs must be unique so editing and deleting target the right record.
    const ids = parsedData.map(project => project.id);

    if (new Set(ids).size !== ids.length) {
      showMessage(
        'Saved project data contains duplicate IDs. ' +
        'The stored data has been left unchanged. ' +
        'Check or clear the browser storage before continuing.'
      );
      return;
    }

    projects = parsedData;
  } catch (error) {
    showMessage(
      'Could not parse saved project data. ' +
      'The stored data has been left unchanged. ' +
      'Check or clear the browser storage before continuing.'
    );
  }
}

function saveProjects() {
  try {
    // Convert the projects array into text for browser storage.
    const serializedProjects = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, serializedProjects);
    showMessage('');
    return true;
  } catch (error) {
    showMessage(
      'Changes could not be saved to browser storage. ' +
      'They may be lost when you refresh the page.'
    );
    return false;
  }
}

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status}`;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      startEditing(project.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      deleteProject(project.id);
    });

    listItem.append(
      projectName,
      projectStatus,
      editButton,
      deleteButton
    );

    projectList.appendChild(listItem);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

function startEditing(id) {
  const project = projects.find(item => item.id === id);

  if (!project) {
    return;
  }

  editingId = project.id;
  nameInput.value = project.name;
  statusInput.value = project.status;

  saveButton.textContent = 'Save changes';
  cancelButton.hidden = false;

  nameInput.focus();
}

function resetForm() {
  form.reset();

  editingId = null;

  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

function deleteProject(id) {
  const project = projects.find(item => item.id === id);

  if (!project) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${project.name}"?`
  );

  if (!confirmed) {
    return;
  }

  const projectIndex = projects.findIndex(
    item => item.id === id
  );

  if (projectIndex === -1) {
    return;
  }

  projects.splice(projectIndex, 1);

  if (editingId === id) {
    resetForm();
  }

  renderProjects();
  saveProjects();
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    showMessage('Please enter a project name.');
    nameInput.focus();
    return;
  }

  if (!['Planned', 'In Progress', 'Completed'].includes(status)) {
    showMessage('Please select a valid project status.');
    return;
  }

  if (editingId !== null) {
    const project = projects.find(
      item => item.id === editingId
    );

    if (!project) {
      resetForm();
      renderProjects();
      showMessage('The project could not be found. Please try again.');
      return;
    }

    // Update the existing project without changing its ID.
    project.name = name;
    project.status = status;
  } else {
    // Create a new project with a unique, stable ID.
    projects.push({
      id: crypto.randomUUID(),
      name: name,
      status: status
    });
  }

  renderProjects();
  resetForm();
  saveProjects();
});

cancelButton.addEventListener('click', () => {
  // Cancel edit without changing the stored collection.
  resetForm();
});

// Restore saved projects and display them when the page starts.
loadProjects();
renderProjects();
