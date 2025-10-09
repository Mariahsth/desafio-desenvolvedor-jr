export function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }
  
  export function getToday() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  