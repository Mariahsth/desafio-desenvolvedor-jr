const fs = require('fs');

function readTasks(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        return [];
    }
}

function writeTasks(filePath, tasks) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error(`Erro ao escrever no arquivo ${filePath}:`, error);
        throw error;
    }
}

module.exports = { readTasks, writeTasks };
