import { renderTasks, showToast } from './ui.js';

const API_URL = 'http://localhost:3000/api/tasks';

export async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao carregar tarefas');
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (err) {
    console.error('Erro em loadTasks:', err);
    showToast('Erro ao carregar tarefas.', 'error');
  }
}

export async function addTask(taskData) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao criar tarefa');
    }

    showToast('Tarefa criada com sucesso!');
    await loadTasks();
  } catch (err) {
    console.error('Erro em addTask:', err);
    showToast(err.message, 'error');
  }
}

export async function updateTask(id, updates) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao atualizar tarefa');
    }

    showToast('Tarefa atualizada com sucesso!');
    await loadTasks();
  } catch (err) {
    console.error('Erro em updateTask:', err);
    showToast(err.message, 'error');
  }
}

export async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir tarefa');
    showToast('Tarefa excluída com sucesso!');
    await loadTasks();
  } catch (err) {
    console.error('Erro em deleteTask:', err);
    showToast(err.message, 'error');
  }
}

export async function toggleTaskCompletion(id, completed) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) throw new Error('Erro ao atualizar status');
    await loadTasks();
    showToast(`Tarefa marcada como ${completed ? 'concluída' : 'ativa'}`);
  } catch (err) {
    console.error('Erro em toggleTaskCompletion:', err);
    showToast('Erro ao atualizar status da tarefa', 'error');
  }
}
