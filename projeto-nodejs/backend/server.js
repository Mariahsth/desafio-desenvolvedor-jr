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
        res.status(500).json({ error: 'Erro ao carregar tarefas' });
    }
});

// POST - Criar tarefa
app.post('/api/tasks', (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Título é obrigatório' });
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const newTask = {
            id: Date.now(),
            title,
            completed: false
        };
        
        tasks.push(newTask);
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
        
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

// PUT - Atualizar tarefa
app.put('/api/tasks/:id', (req, res) => {
    try {
        const taskId = req.params.id;
        const { completed } = req.body;
        
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        tasks[taskIndex].completed = completed;
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
        
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

// DELETE - Remover tarefa
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const taskId = req.params.id;
        
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        
        if (filteredTasks.length === tasks.length) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(filteredTasks, null, 2));
        
        res.json({ message: 'Tarefa removida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover tarefa' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});