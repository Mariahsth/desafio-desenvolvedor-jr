const API_URL = 'http://localhost:3000/api';

let allTasks = []; 

document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('taskInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
});

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        allTasks = await response.json();
        displayTasks(allTasks);
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        alert('Erro ao carregar tarefas. Verifique se o servidor está rodando.');
    }
}

async function addTask() {
    const title = document.getElementById('taskInput').value.trim();
    const dueDate = document.getElementById('dueDateInput').value;

    if (!title) return alert('Digite uma tarefa!');

    if (dueDate) {
        const [year, month, day] = dueDate.split('-').map(Number);
        const selected = new Date(year, month - 1, day); 
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        console.log("Data de hoje:", today);
        console.log("Data do prazo:", selected);
    
        if (selected < today) return alert('A data de prazo não pode ser anterior a de hoje.');
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, dueDate })
        });

        if (response.ok) {
            document.getElementById('taskInput').value = '';
            document.getElementById('dueDateInput').value = '';
            loadTasks();
        } else {
            const error = await response.json();
            if (error.error === 'Já existe uma tarefa com esse título') {
                alert('Não é possível criar tarefas com títulos repetidos!');
            } else {
                alert(error.error || 'Erro ao adicionar tarefa');
            }
        }
    } catch (error) {
        alert('Erro ao adicionar tarefa');
    }
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        alert('Erro ao atualizar tarefa');
    }
}

async function deleteTask(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        alert('Erro ao excluir tarefa');
    }
}

function displayTasks(tasks) {
    const tasksListActive = document.getElementById('tasksListActive');
    const tasksListCompleted = document.getElementById('tasksListCompleted');

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    if (activeTasks.length === 0) {
        tasksListActive.innerHTML = '<li style="text-align:center;color:#666;">Nenhuma tarefa em andamento</li>';
    } else {
        tasksListActive.innerHTML = activeTasks.map(task => renderTaskItem(task)).join('');
    }

    if (completedTasks.length === 0) {
        tasksListCompleted.innerHTML = '<li style="text-align:center;color:#666;">Nenhuma tarefa concluída</li>';
    } else {
        tasksListCompleted.innerHTML = completedTasks.map(task => renderTaskItem(task)).join('');
    }
}

function renderTaskItem(task) {
    const statusColor =
        task.status === 'Atrasado' ? 'red' :
        task.status === 'Dentro do prazo' ? 'green' :
        task.status === 'Concluído' ? 'gray' : '#666';

    return `
    <li class="task-item ${task.completed ? 'completed' : ''}"  data-id="${task.id}">
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
                <button class="btn-danger btn-small" onclick="deleteTask('${task.id}')">Excluir</button>
            </div>
        </div>
    </li>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function editTask(id, currentTitle, currentDueDate) {
    const textSpan = document.getElementById(`text-${id}`);
    const dateSpan = document.getElementById(`date-${id}`);
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

}

async function saveEdit(id) {
    const newTitle = document.getElementById(`edit-title-${id}`).value.trim();
    const newDueDate = document.getElementById(`edit-date-${id}`).value;

    if (!newTitle) return alert('O título não pode ser vazio.');

    if (newDueDate) {
        const today = new Date();
        const [year, month, day] = newDueDate.split('-').map(Number);
        const selected = new Date(year, month - 1, day); 
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
        console.log("Data de hoje:", today);
        console.log("Data do prazo:", selected);
        if (selected < today) return alert('A data de prazo não pode ser anterior a de hoje.');
    }

    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, dueDate: newDueDate || null })
    });

    if (res.ok) loadTasks();
    else {
        const error = await res.json();
        alert(error.error || 'Erro ao salvar edição');
    }
}

function cancelEdit(button, originalTitle, originalDueDate) {
    const li = button.closest('.task-item'); 

    const titleColumn = li.querySelector('.col-title');
    titleColumn.innerHTML = `<span class="task-text" id="text-${li.dataset.id}">${originalTitle}</span>`;

    const dateColumn = li.querySelector('.col-due-date');
    if (dateColumn) {
        dateColumn.innerHTML = originalDueDate ? `<span class="due-date" id="date-${li.dataset.id}">${formatDate(originalDueDate)}</span>` : '';
    }

    const actionsColumn = li.querySelector('.col-actions');
    actionsColumn.innerHTML = `
        <div class="task-actions">
            <button class="btn-edit btn-small" onclick="editTask('${li.dataset.id}', '${originalTitle.replace(/'/g, "\\'")}', '${originalDueDate || ''}')">Editar</button>
            <button class="btn-danger btn-small" onclick="deleteTask('${li.dataset.id}')">Excluir</button>
        </div>
    `;

    li.classList.remove('editing');
}

document.getElementById('searchTitle').addEventListener('input', () => {
    applyFilters();
});

function clearFilters() {
    document.getElementById('filterStart').value = '';
    document.getElementById('filterEnd').value = '';
    document.getElementById('searchTitle').value = '';
    displayTasks(allTasks);
}

function applyFilters() {
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