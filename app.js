// app.js
// Usa <script type="module" src="app.js"></script> en tus páginas

// 1. Importa las funciones de Firebase desde el CDN (versión 11.3.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// 2. Configuración de Firebase (reemplaza con tus datos, ya vienen incluidos)
const firebaseConfig = {
  apiKey: "AIzaSyD2dZO307P3B_YmH8dZI5-ll_ZO6uzy0SU",
  authDomain: "inframe2.firebaseapp.com",
  databaseURL: "https://inframe2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "inframe2",
  storageBucket: "inframe2.firebasestorage.app",
  messagingSenderId: "68415435303",
  appId: "1:68415435303:web:b26db7799d71dee6119402"
};

// 3. Inicializa Firebase, Auth y Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 4. Funciones de autenticación y control de acceso
// Estas funciones se adjuntan al objeto window para que sean accesibles globalmente

/**
 * REGISTRO: Crea un nuevo usuario y almacena sus datos en Firestore.
 * Se establece "subscriptionActive" en false.
 */
window.registrarUsuario = async function(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Crea el documento del usuario en la colección "usuarios"
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      subscriptionActive: false
    });
    alert("Usuario registrado correctamente. Ahora inicia sesión.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error en el registro:", error.message);
    alert("Error en el registro: " + error.message);
  }
};

/**
 * INICIO DE SESIÓN: Inicia sesión y redirige según el estado de la suscripción.
 * Si subscriptionActive es true, redirige a "platform.html"; de lo contrario, a "pago.html".
 */
window.iniciarSesion = async function(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, "usuarios", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data.subscriptionActive) {
        window.location.href = "platform.html";
      } else {
        window.location.href = "pago.html";
      }
    } else {
      alert("No se encontró el registro del usuario. Contacta soporte.");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
};

/**
 * RESTABLECER CONTRASEÑA: Envía un correo para restablecer la contraseña.
 */
window.restablecerContrasena = async function(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Se ha enviado un correo para restablecer la contraseña.");
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento:", error.message);
    alert("Error: " + error.message);
  }
};

/**
 * VALIDAR PAGO EN CONFIRMACIÓN: Se llama desde la página de confirmación de pago.
 * Actualiza en Firestore el campo "subscriptionActive" a true.
 */
window.validarPagoEnConfirmacion = function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        await updateDoc(userDocRef, { subscriptionActive: true });
        alert("Pago confirmado. ¡Bienvenido a la plataforma!");
        window.location.href = "platform.html";
      } catch (error) {
        console.error("Error al confirmar el pago:", error.message);
        alert("Error al confirmar el pago: " + error.message);
      }
    } else {
      window.location.href = "login.html";
    }
  });
};

/**
 * RESTRINGIR CONTENIDO: Se llama en páginas protegidas.
 * Verifica que el usuario esté autenticado y que su suscripción esté activa;
 * si no es así, redirige a "pago.html".
 */
window.restringirContenido = function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          if (!data.subscriptionActive) {
            alert("Necesitas activar tu suscripción para acceder a este contenido.");
            window.location.href = "pago.html";
          }
          // Si la suscripción está activa, el usuario puede continuar.
        } else {
          await signOut(auth);
          window.location.href = "login.html";
        }
      } catch (error) {
        console.error("Error al verificar la suscripción:", error.message);
        alert("Error de conexión. Intenta de nuevo.");
      }
    } else {
      window.location.href = "login.html";
    }
  });
};

/**
 * REDIRECCIÓN DESDE INDEX: Si el usuario ya está autenticado y ha pagado,
 * redirige a "platform.html" para que no se muestre la landing.
 */
window.redirigirSiPagado = function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().subscriptionActive) {
          window.location.href = "platform.html";
        }
      } catch (error) {
        console.error("Error al verificar el estado del usuario:", error.message);
      }
    }
  });
};