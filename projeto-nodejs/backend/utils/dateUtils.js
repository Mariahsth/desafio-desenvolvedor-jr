// Converte uma string de data (formato "YYYY-MM-DD") em um objeto Date.
function parseDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

// Verifica se a data informada é anterior à data de hoje.
function isPastDate(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = parseDate(dateStr);
    return selected && selected < today;
}

// Retorna o status da tarefa com base em sua data e conclusão.
function getTaskStatus(completed, dueDate) {
    if (completed) return 'Concluído';
    if (!dueDate) return 'Sem prazo';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseDate(dueDate);
    return due < today ? 'Atrasado' : 'Dentro do prazo';
}

module.exports = {
    parseDate,
    isPastDate,
    getTaskStatus
};
