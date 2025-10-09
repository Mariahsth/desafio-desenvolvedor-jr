const { isPastDate, getTaskStatus } = require('../utils/dateUtils');
const { readTasks, writeTasks } = require('../utils/fileUtils');
const { titleExists } = require('../utils/titleUtils');



exports.getTasks = (req, res) => {
    try {
        const tasks = readTasks(req.dataFile);
        const updatedTasks = tasks.map(task => ({
            ...task,
            status: getTaskStatus(task.completed, task.dueDate)
        }));

        res.json(updatedTasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ error: 'Erro ao carregar tarefas' });
    }
};

exports.createTask = (req, res) => {
    console.log('POST /api/tasks chamado com body:', req.body);
    try {
        const { title, dueDate } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Título é obrigatório' });
        }
        if (dueDate && isPastDate(dueDate)) {
            return res.status(400).json({ error: 'A data de prazo não pode ser anterior a hoje' });
        }

        const tasks = readTasks(req.dataFile);

        if (titleExists(tasks, title)) {
            return res.status(400).json({ error: 'Já existe uma tarefa com esse título' });
        }

        const newTask = {
            id: Date.now().toString(),
            title,
            completed: false,
            dueDate: dueDate || null,
            status: getTaskStatus(false, dueDate)
        };

        tasks.push(newTask);
        writeTasks(req.dataFile, tasks);
        console.log('Tarefa criada:', newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
};

exports.updateTask = (req, res) => {
    console.log(`PUT /api/tasks/${req.params.id} chamado com body:`, req.body);
    try {
        const taskId = req.params.id;
        const { completed, title, dueDate } = req.body;
        const tasks = readTasks(req.dataFile);
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        if (title) {
            if (titleExists(tasks, title, taskId)) {
                return res.status(400).json({ error: 'Já existe uma tarefa com esse título' });
            }
            tasks[taskIndex].title = title;
        }

        if (typeof completed === 'boolean') tasks[taskIndex].completed = completed;

        if (dueDate !== undefined) {
            if (dueDate && isPastDate(dueDate)) {
                return res.status(400).json({ error: 'A data de prazo não pode ser anterior a hoje' });
            }
            tasks[taskIndex].dueDate = dueDate || null;
        }

        const t = tasks[taskIndex];
        t.status = getTaskStatus(t.completed, t.dueDate);

        writeTasks(req.dataFile, tasks);

        console.log(`Tarefa ${taskId} atualizada`);
        res.status(200).json({
            message: 'Tarefa atualizada com sucesso',
            task: t
        });
    } catch (error) {
        console.error(`Erro ao atualizar tarefa em PUT /api/tasks/${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
};

exports.deleteTask = (req, res) => {
    console.log(`DELETE /api/tasks/${req.params.id} chamado`);
    try {
        const taskId = req.params.id;
        const tasks = readTasks(req.dataFile);
        const filteredTasks = tasks.filter(task => task.id !== taskId);

        if (filteredTasks.length === tasks.length) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        writeTasks(req.dataFile, filteredTasks);
        console.log(`Tarefa ${taskId} removida`);
        res.json({ message: 'Tarefa removida com sucesso' });
    } catch (error) {
        console.error(`Erro ao deletar tarefa em DELETE /api/tasks/${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro ao remover tarefa' });
    }
};
