import React from "react";

function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function StatsPanel({ reminders }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthReminders = reminders.filter(r => {
    const d = parseLocalDate(r.date);
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const completed = monthReminders.filter(r => r.done).length;
  const total = monthReminders.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryCount = monthReminders.reduce((acc, r) => {
    if (!r.category) return acc;
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  const mostUsedCategory = Object.keys(categoryCount).length > 0
    ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
    : "Ninguna";

  const hourCount = monthReminders.reduce((acc, r) => {
    if (!r.time) return acc;
    const hour = r.time.split(":")[0];
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const mostFrequentHour = Object.keys(hourCount).length > 0
    ? Object.keys(hourCount).reduce((a, b) => hourCount[a] > hourCount[b] ? a : b)
    : "Ninguna";

  const assignedCount = monthReminders.reduce((acc, r) => {
    if (!r.assignedTo) return acc;
    acc[r.assignedTo] = (acc[r.assignedTo] || 0) + 1;
    return acc;
  }, {});
  const mostFrequentAssigned = Object.keys(assignedCount).length > 0
    ? Object.keys(assignedCount).reduce((a, b) => assignedCount[a] > assignedCount[b] ? a : b)
    : "Ninguno";

  return (
    <div className="stats-panel">
      <h2>📊 Estadísticas</h2>
      <p>✔ Completadas este mes: <strong>{completionRate}%</strong></p>
      <p>🏷️ Categoría más usada: <strong>{mostUsedCategory}</strong></p>
      <p>⏰ Hora más frecuente: <strong>{mostFrequentHour}:00</strong></p>
      <p>👤 Responsable más frecuente: <strong>{mostFrequentAssigned}</strong></p>
    </div>
  );
}