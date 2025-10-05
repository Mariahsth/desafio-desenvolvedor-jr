const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// GET - Listar tarefas
app.get('/api/tasks', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        res.json(tasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ error: 'Erro ao carregar tarefas' });
    }
});

// POST - Criar tarefa
app.post('/api/tasks', (req, res) => {
    console.log('POST /api/tasks chamado com body:', req.body);
    try {
        const { title, dueDate } = req.body;
        
        if (!title) {
            console.warn('Tentativa de criar tarefa sem título');
            return res.status(400).json({ error: 'Título é obrigatório' });
        }

        if (dueDate) {
            const today = new Date();
            const selected = new Date(dueDate);

            today.setHours(0, 0, 0, 0);
            selected.setHours(0, 0, 0, 0);

            if (selected < today) {
                return res.status(400).json({ error: 'A data de prazo não pode ser anterior a hoje' });
            }
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const newTask = {
            id: Date.now().toString(),
            title,
            completed: false,
            dueDate: dueDate || null
        };
        
        tasks.push(newTask);
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
        console.log('Tarefa criada:', newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

// PUT - Atualizar tarefa
app.put('/api/tasks/:id', (req, res) => {
    console.log(`PUT /api/tasks/${req.params.id} chamado com body:`, req.body);
    try {
        const taskId = req.params.id;
        const { completed } = req.body;
        
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            console.warn(`Tarefa ${taskId} não encontrada`);
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        tasks[taskIndex].completed = completed;
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
        console.log(`Tarefa ${taskId} atualizada para completed=${completed}`);
        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error(`Erro ao atualizar tarefa em PUT /api/tasks/${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

// DELETE - Remover tarefa
app.delete('/api/tasks/:id', (req, res) => {
    console.log(`DELETE /api/tasks/${req.params.id} chamado`);
    try {
        const taskId = req.params.id;
        
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        
        if (filteredTasks.length === tasks.length) {
            console.warn(`Tentativa de deletar tarefa inexistente: ${taskId}`);
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(filteredTasks, null, 2));
        console.log(`Tarefa ${taskId} removida`);
        res.json({ message: 'Tarefa removida' });
    } catch (error) {
        console.error(`Erro ao deletar tarefa em DELETE /api/tasks/${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro ao remover tarefa' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
