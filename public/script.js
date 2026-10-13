
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Projects exist only while the page is loaded.
const projects = [];

function renderProjects() {
  // Clear the list before rendering to avoid duplicates.
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status}`;

    listItem.append(projectName, projectStatus);
    projectList.appendChild(listItem);
  });

  // Update the empty-state message if it exists.
  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  // Reject an empty project name.
  if (!name) {
    nameInput.value = '';
    nameInput.focus();
    return;
  }

  // Create a project with a unique, stable ID.
  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  projects.push(project);

  // Display all projects, including the newly added one.
  renderProjects();

  // Reset the form for the next project.
  form.reset();
});
