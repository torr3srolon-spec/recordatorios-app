import { useState } from "react";
import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(auth.currentUser);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    onLogin(null);
  }

  return (
    <div className="auth">
      <h2>{isRegister ? "Registro" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Correo" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button type="submit">
          {isRegister ? "Registrarse" : "Ingresar"}
        </button>
      </form>

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister 
          ? "¿Ya tienes cuenta? Inicia sesión" 
          : "¿No tienes cuenta? Regístrate"}
      </button>

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}