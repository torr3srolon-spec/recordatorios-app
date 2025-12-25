import { useState, useEffect } from "react";
import Auth from "./Auth";             
import StatsPanel from "./StatsPanel";  
import { db } from "./firebase";       
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);        
  const [reminders, setReminders] = useState([]); 

  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!user) return;
    const remindersRef = collection(db, "users", user.uid, "reminders");

    const unsubscribe = onSnapshot(remindersRef, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  async function addReminder(e) {
    e.preventDefault();

    if (!text || !date) {
      alert("Debes completar al menos el texto y la fecha.");
      return;
    }

    try {
      const remindersRef = collection(db, "users", user.uid, "reminders");

      const newReminder = {
        text,
        date,
        time,
        category,
        assignedTo,
        done: false,
        history: [
          { action: "creado", by: user.email, date: new Date().toLocaleString() }
        ]
      };

      await addDoc(remindersRef, newReminder);

      setText("");
      setDate("");
      setTime("");
      setCategory("");
      setAssignedTo("");

      console.log("✅ Recordatorio creado correctamente");
    } catch (err) {
      console.error("❌ Error al crear recordatorio:", err);
      alert("No se pudo crear la tarea: " + err.message);
    }
  }

  async function toggleDone(id, current) {
    const ref = doc(db, "users", user.uid, "reminders", id);
    await updateDoc(ref, {
      done: !current.done,
      history: [
        ...current.history,
        { action: current.done ? "marcado como pendiente" : "completado", by: user.email, date: new Date().toLocaleString() }
      ]
    });
  }

  async function deleteReminder(id) {
    const ref = doc(db, "users", user.uid, "reminders", id);
    await deleteDoc(ref);
  }

  const filteredReminders = reminders.filter(r => {
    if (filter === "pending") return !r.done;
    if (filter === "completed") return r.done;
    return true;
  });

  const categoryFilteredReminders = filteredReminders.filter(r => {
    if (categoryFilter === "all") return true;
    return r.category === categoryFilter;
  });

  const searchedReminders = categoryFilteredReminders.filter(r =>
    r.text.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = reminders.filter(r => !r.done).length;
  const completedCount = reminders.filter(r => r.done).length;

  function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks = [];
    let currentDay = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < (firstDay === 0 ? 6 : firstDay - 1)) || currentDay > daysInMonth) {
          week.push(null);
        } else {
          week.push(currentDay);
          currentDay++;
        }
      }
      weeks.push(week);
    }
    return weeks;
  }

  const calendarWeeks = generateCalendar(currentYear, currentMonth);

  function getRemindersForDay(day) {
    return reminders.filter(r => {
      if (!r.date) return false;
      const reminderDate = new Date(r.date);
      return (
        reminderDate.getDate() === day &&
        reminderDate.getMonth() === currentMonth &&
        reminderDate.getFullYear() === currentYear
      );
    });
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className={darkMode ? "app-layout dark" : "app-layout"}>
      <div className={darkMode ? "container dark" : "container"}>
        <div className="header">
          <h1>Mis Recordatorios</h1>
          <div className="user-info">{user.email}</div>
        </div>

        <button className="toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙 Noche" : "☀️ Día"}
        </button>

        {/* Formulario */}
        <form onSubmit={addReminder}>
          <input type="text" placeholder="Nuevo recordatorio" value={text} onChange={e => setText(e.target.value)} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Sin categoría</option>
            <option value="Trabajo">Trabajo</option>
            <option value="Personal">Personal</option>
            <option value="Estudio">Estudio</option>
          </select>
          <input type="text" placeholder="Asignado a..." value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
          <button type="submit">Agregar</button>
        </form>

        {/* Buscador */}
        <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="search" />

        {/* Filtros */}
        <div className="filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button>
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pendientes</button>
          <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completados</button>
        </div>

        <div className="filters">
          <button className={categoryFilter === "all" ? "active" : ""} onClick={() => setCategoryFilter("all")}>Todas</button>
          <button className={categoryFilter === "Trabajo" ? "active" : ""} onClick={() => setCategoryFilter("Trabajo")}>Trabajo</button>
          <button className={categoryFilter === "Personal" ? "active" : ""} onClick={() => setCategoryFilter("Personal")}>Personal</button>
          <button className={categoryFilter === "Estudio" ? "active" : ""} onClick={() => setCategoryFilter("Estudio")}>Estudio</button>
        </div>

        <div className="counter">
          Pendientes: {pendingCount} | Completados: {completedCount}
        </div>

        {/* Lista de recordatorios */}
        <ul>
          {searchedReminders.map(r => (
            <li key={r.id}>
              <span className={r.done ? "completed" : "pending"}>
                {r.text} 
                {r.date && <> 📅 {r.date}</>} 
                {r.time && <> ⏰ {r.time}</>} 
                {r.category && <> 🏷️ {r.category}</>} 
                                {r.assignedTo && <> 👤 {r.assignedTo}</>}
              </span>
              <button onClick={() => toggleDone(r.id, r)}>✔</button>
              <button onClick={() => deleteReminder(r.id)}>🗑</button>

              {/* Historial */}
              <details>
                <summary>Historial</summary>
                <ul>
                  {r.history.map((h, i) => (
                    <li key={i}>
                      {h.action} por {h.by} ({h.date})
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </div>

      {/* Calendario */}
      <div className={darkMode ? "calendar dark" : "calendar"}>
        <div className="calendar-header">
          <button onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}>◀</button>
          <span>
            {new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}>▶</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th>
            </tr>
          </thead>
          <tbody>
            {calendarWeeks.map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => {
                  if (!day) return <td key={j}></td>;
                  const dayReminders = getRemindersForDay(day);
                  const hasReminder = dayReminders.length > 0;
                  return (
                    <td
                      key={j}
                      className={hasReminder ? "has-reminder" : ""}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal con tareas del día */}
      {selectedDay && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              Tareas del {selectedDay} de {new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <ul>
              {getRemindersForDay(selectedDay).map(r => (
                <li key={r.id}>
                  <span className={r.done ? "completed" : "pending"}>
                    {r.text} {r.time && <> ⏰ {r.time}</>} 
                    {r.category && <> 🏷️ {r.category}</>} 
                    {r.assignedTo && <> 👤 {r.assignedTo}</>}
                  </span>
                  <button onClick={() => toggleDone(r.id, r)}>✔</button>
                  <button onClick={() => deleteReminder(r.id)}>🗑</button>

                  {/* Historial en modal */}
                  <details>
                    <summary>Historial</summary>
                    <ul>
                      {r.history.map((h, i) => (
                        <li key={i}>
                          {h.action} por {h.by} ({h.date})
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
              {getRemindersForDay(selectedDay).length === 0 && <p>No hay tareas para este día.</p>}
            </ul>
            <button onClick={() => setSelectedDay(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Panel de estadísticas */}
      <StatsPanel reminders={reminders} />
    </div>
  );
}