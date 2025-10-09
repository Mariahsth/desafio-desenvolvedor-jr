import { formatDate } from './utils.js';
import { addTask, updateTask, deleteTask, toggleTaskCompletion } from './api.js';

const tasksListActive = document.getElementById('tasksListActive');
const tasksListCompleted = document.getElementById('tasksListCompleted');
const toastContainer = document.getElementById('toast-container');
const modal = document.getElementById('confirmation-modal');
const modalConfirmBtn = document.getElementById('modal-confirm-button');



let allTasks = [];
let taskToDelete = null;


document.querySelectorAll('.collapse-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const sectionId = e.target.closest('.task-list-section').querySelector('.section-content').id;
      toggleSection(sectionId.includes('active') ? 'active' : 'completed');
    });
  });
  document.querySelector('.filter-actions .btn-secondary:nth-child(1)')?.addEventListener('click', applyFilters);
  document.querySelector('.filter-actions .btn-secondary:nth-child(2)')?.addEventListener('click', clearFilters);
  document.querySelector('.modal .btn-secondary')?.addEventListener('click', hideModal);  
  document.getElementById('sort-title').addEventListener('click', () => handleSort('title'));
  document.getElementById('sort-date').addEventListener('click', () => handleSort('dueDate'));

/* ============  RENDERIZAÇÃO ============ */
export function renderTasks(tasks) {
  allTasks = tasks;
  displayTasks(allTasks);
}

function displayTasks(tasks) {
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  tasksListActive.innerHTML = activeTasks.length
    ? activeTasks.map(renderTaskItem).join('')
    : '<li style="text-align:center;color:#666;">Nenhuma tarefa em andamento</li>';

  tasksListCompleted.innerHTML = completedTasks.length
    ? completedTasks.map(renderTaskItem).join('')
    : '<li style="text-align:center;color:#666;">Nenhuma tarefa concluída</li>';
}

function renderTaskItem(task) {
  const statusColor =
    task.status === 'Atrasado' ? 'red' :
    task.status === 'Dentro do prazo' ? 'green' :
    task.status === 'Concluído' ? 'gray' : '#666';

  return `
  <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
    <div class="col-checkbox">
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}', ${task.completed})">
    </div>
    <div class="col-title">
      <span class="task-text" id="text-${task.id}">${task.title}</span>
    </div>
    <div class="col-due-date">
      ${task.dueDate ? `<span class="due-date" id="date-${task.id}">${formatDate(task.dueDate)}</span>` : ''}
    </div>
    <div class="col-status">
      <span class="status" style="color:${statusColor};font-weight:600;">${task.status}</span>
    </div>
    <div class="col-actions">
      <div class="task-actions">
        <button class="btn-edit btn-small" onclick="editTask('${task.id}', '${task.title.replace(/'/g, "\\'")}', '${task.dueDate || ''}')">Editar</button>
        <button class="btn-danger btn-small" onclick="showModal('${task.id}')">Excluir</button>
      </div>
    </div>
  </li>`;
}

/* ============  EVENTOS ============ */
window.toggleTask = async function(id, completed) {
  await toggleTaskCompletion(id, !completed);
};

window.editTask = function(id, currentTitle, currentDueDate) {
  const textSpan = document.getElementById(`text-${id}`);
  const li = textSpan.closest('.task-item');
  li.classList.add('editing');

  const dateValue = currentDueDate ? currentDueDate.split('T')[0] : '';
  const titleColumn = li.querySelector('.col-title');
  titleColumn.innerHTML = `
    <input type="text" id="edit-title-${id}" value="${currentTitle}">
    <input type="date" id="edit-date-${id}" value="${dateValue}">
    <div class="task-actions">
      <button class="btn-primary btn-small" onclick="saveEdit('${id}')">Salvar</button>
      <button class="btn-secondary btn-small" onclick="cancelEdit(this, '${currentTitle.replace(/'/g, "\\'")}', '${currentDueDate || ''}')">Cancelar</button>
    </div>
  `;
};

window.saveEdit = async function(id) {
  const newTitle = document.getElementById(`edit-title-${id}`).value.trim();
  const newDueDate = document.getElementById(`edit-date-${id}`).value;

  if (!newTitle) return showToast('O título não pode ser vazio.', 'warning');

  if (newDueDate) {
    const today = new Date();
    const [year, month, day] = newDueDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) return showToast('A data de prazo não pode ser anterior a de hoje.', 'warning');
  }

  await updateTask(id, { title: newTitle, dueDate: newDueDate || null });
};

window.cancelEdit = function(button, originalTitle, originalDueDate) {
  const li = button.closest('.task-item');
  const titleColumn = li.querySelector('.col-title');
  titleColumn.innerHTML = `<span class="task-text" id="text-${li.dataset.id}">${originalTitle}</span>`;

  const dateColumn = li.querySelector('.col-due-date');
  dateColumn.innerHTML = originalDueDate ? `<span class="due-date" id="date-${li.dataset.id}">${formatDate(originalDueDate)}</span>` : '';

  const actionsColumn = li.querySelector('.col-actions');
  actionsColumn.innerHTML = `
    <div class="task-actions">
      <button class="btn-edit btn-small" onclick="editTask('${li.dataset.id}', '${originalTitle.replace(/'/g, "\\'")}', '${originalDueDate || ''}')">Editar</button>
      <button class="btn-danger btn-small" onclick="showModal('${li.dataset.id}')">Excluir</button>
    </div>
  `;
  li.classList.remove('editing');
};

/* ============  MODAL ============ */
window.showModal = function(id) {
  taskToDelete = id;
  modal.classList.remove('hidden');
};

export function hideModal() {
  modal.classList.add('hidden');
  taskToDelete = null;
}

modalConfirmBtn?.addEventListener('click', async () => {
  if (taskToDelete) await deleteTask(taskToDelete);
  hideModal();
});

/* ============  TOASTS ============ */
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  void toast.offsetWidth; // trigger reflow
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ============  FILTROS ============ */
export function applyFilters() {
    const startDateValue = document.getElementById('filterStart').value;
    const endDateValue = document.getElementById('filterEnd').value;
    const searchTitleValue = document.getElementById('searchTitle').value.trim().toLowerCase();

    let filtered = allTasks.filter(t => !t.completed); 

    if (startDateValue) {
        const startDate = new Date(startDateValue);
        startDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) >= startDate);
    }

    if (endDateValue) {
        const endDate = new Date(endDateValue);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) <= endDate);
    }

    if (searchTitleValue) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTitleValue));
    }

    displayTasks([...filtered, ...allTasks.filter(t => t.completed)]);
}

export function clearFilters() {
  document.getElementById('filterStart').value = '';
  document.getElementById('filterEnd').value = '';
  document.getElementById('searchTitle').value = '';
  displayTasks(allTasks);
}

/* ============  SEÇÕES RECOLHÍVEIS ============ */
export function toggleSection(type) {
  const section = document.getElementById(`section-${type}`);
  const button = section.previousElementSibling.querySelector('.collapse-btn');
  section.classList.toggle('collapsed');
  button.textContent = section.classList.contains('collapsed') ? 'Expandir ▼' : 'Recolher ▲';
}

/* ============  ADICIONAR TAREFA ============ */
window.addTask = async function() {
  const titleInput = document.getElementById('taskInput');
  const dueDateInput = document.getElementById('dueDateInput');

  const title = titleInput.value.trim();
  const dueDate = dueDateInput.value || null;

  if (!title) return showToast('O título é obrigatório', 'error');

  await addTask({ title, dueDate });
  titleInput.value = '';
  dueDateInput.value = '';
};

/* ============  ORDENAR COLUNAS ============ */

let sortConfig = { key: null, ascending: true };

function sortTasks(tasks, key) {
  return tasks.slice().sort((a, b) => {
    if (!a[key]) return 1; 
    if (!b[key]) return -1;

    if (key === 'title') {
      return sortConfig.ascending
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (key === 'dueDate') {
      return sortConfig.ascending
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    }
    return 0;
  });
}

function handleSort(key) {
  if (sortConfig.key === key) {
    sortConfig.ascending = !sortConfig.ascending; 
  } else {
    sortConfig.key = key;
    sortConfig.ascending = true;
  }

  const sortedTasks = sortTasks(allTasks, key);
  displayTasks(sortedTasks);

  const titleHeader = document.getElementById('sort-title');
  const dateHeader = document.getElementById('sort-date');

  if (key === 'title') {
    titleHeader.textContent = `Título ${sortConfig.ascending ? '▲' : '▼'}`;
    dateHeader.textContent = 'Prazo ▼'; 
  } else if (key === 'dueDate') {
    dateHeader.textContent = `Prazo ${sortConfig.ascending ? '▲' : '▼'}`;
    titleHeader.textContent = 'Título ▼'; 
  }
}