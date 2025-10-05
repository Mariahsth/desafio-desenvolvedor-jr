const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('taskInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
});

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        displayTasks(tasks);
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
        const today = new Date();
        const selected = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
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
            alert(error.error || 'Erro ao adicionar tarefa');
        }
    } catch (error) {
        alert('Erro ao adicionar tarefa');
    }
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
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
    const tasksList = document.getElementById('tasksList');
    if (tasks.length === 0) {
        tasksList.innerHTML = '<li style="text-align:center;color:#666;">Nenhuma tarefa</li>';
        return;
    }

    tasksList.innerHTML = tasks.map(task => {
        const statusColor =
            task.status === 'Atrasado' ? 'red' :
            task.status === 'Dentro do prazo' ? 'green' :
            task.status === 'Concluído' ? 'gray' : '#666';

        return `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}', ${task.completed})">
            <span class="task-text" id="text-${task.id}">${task.title}</span>
            ${task.dueDate ? `<span class="due-date" id="date-${task.id}">${formatDate(task.dueDate)}</span>` : ''}
            <span class="status" style="color:${statusColor};font-weight:600;">${task.status}</span>
            <div class="task-actions">
                <button class="btn-edit btn-small" onclick="editTask('${task.id}', '${task.title.replace(/'/g, "\\'")}', '${task.dueDate || ''}')">Editar</button>
                <button class="btn-danger btn-small" onclick="deleteTask('${task.id}')">Excluir</button>
            </div>
        </li>`;
    }).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function editTask(id, currentTitle, currentDueDate) {
    const textSpan = document.getElementById(`text-${id}`);
    const dateSpan = document.getElementById(`date-${id}`);
    const li = textSpan.parentElement;

    li.classList.add('editing');

    const dateValue = currentDueDate ? currentDueDate.split('T')[0] : '';

    textSpan.innerHTML = `
        <input type="text" id="edit-title-${id}" value="${currentTitle}" style="width:40%;">
        <input type="date" id="edit-date-${id}" value="${dateValue}">
        <button onclick="saveEdit('${id}')">Salvar</button>
        <button onclick="cancelEdit('${id}', '${currentTitle.replace(/'/g, "\\'")}', '${currentDueDate || ''}')">Cancelar</button>
    `;

    if (dateSpan) dateSpan.style.display = 'none';
}

async function saveEdit(id) {
    const newTitle = document.getElementById(`edit-title-${id}`).value.trim();
    const newDueDate = document.getElementById(`edit-date-${id}`).value;

    if (!newTitle) return alert('O título não pode ser vazio.');

    if (newDueDate) {
        const today = new Date();
        const selected = new Date(newDueDate);
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
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

function cancelEdit(id, originalTitle, originalDueDate) {
    const textSpan = document.getElementById(`text-${id}`);
    const dateSpan = document.getElementById(`date-${id}`);
    textSpan.textContent = originalTitle;
    if (dateSpan) {
        dateSpan.textContent = originalDueDate ? formatDate(originalDueDate) : '';
        dateSpan.style.display = '';
    }
    textSpan.parentElement.classList.remove('editing');
}
