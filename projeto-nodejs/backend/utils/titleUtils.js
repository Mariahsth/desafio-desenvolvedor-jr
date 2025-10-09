function titleExists(tasks, title, ignoreId = null) {
    return tasks.some(t => 
        t.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        t.id !== ignoreId
    );
}

module.exports = { titleExists };