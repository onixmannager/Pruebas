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

// 2. Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDngD8Yc5tuKeLar8-AxlCSGQXZdYNBEW0",
  authDomain: "cinonix-3a65d.firebaseapp.com",
  projectId: "cinonix-3a65d",
  storageBucket: "cinonix-3a65d.appspot.com",
  messagingSenderId: "298364890273",
  appId: "1:298364890273:web:f8d61cd538f228648f54e0",
  measurementId: "G-9L2E23K72W"
};

// 3. Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 4. Funciones de autenticación

/** 🔹 REGISTRO DE USUARIO */
window.registrarUsuario = async function(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardar en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      subscriptionActive: false
    });

    alert("Usuario registrado correctamente.");
    window.location.href = "001login.html";
  } catch (error) {
    console.error("Error en el registro:", error.message);
    alert("Error en el registro: " + error.message);
  }
};

/** 🔹 INICIO DE SESIÓN */
window.iniciarSesion = async function(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, "usuarios", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      window.location.href = data.subscriptionActive ? "cinonix.html" : "004pago.html";
    } else {
      alert("No se encontró el registro del usuario.");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
};

/** 🔹 RESTABLECER CONTRASEÑA */
window.restablecerContrasena = async function(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Se ha enviado un correo para restablecer la contraseña.");
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error.message);
    alert("Error: " + error.message);
  }
};

/** 🔹 CONFIRMAR PAGO Y ACTIVAR CUENTA */
window.validarPagoEnConfirmacion = async function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Verificar si ya estaba activo
          if (userData.subscriptionActive) {
            alert("Tu cuenta ya está activa.");
            window.location.href = "platform.html";
            return;
          }

          // Simulación de verificación de pago (aquí deberías integrar con tu pasarela de pago)
          const pagoVerificado = await verificarPago(user.uid);

          if (pagoVerificado) {
            await updateDoc(userDocRef, { subscriptionActive: true });
            alert("Pago confirmado. Accediendo a la plataforma...");
            window.location.href = "platform.html";
          } else {
            alert("No se encontró un pago válido. Contacta con soporte.");
          }
        } else {
          alert("Error: No se encontró información del usuario.");
        }
      } catch (error) {
        console.error("Error al confirmar el pago:", error.message);
        alert("Error al confirmar el pago: " + error.message);
      }
    } else {
      window.location.href = "login.html";
    }
  });
};

/** 🔹 FUNCIÓN DE VERIFICACIÓN DE PAGO (debes integrarla con tu proveedor de pagos) */
async function verificarPago(userId) {
  try {
    // Aquí deberías realizar una consulta a tu base de datos o API de pago
    console.log(`Verificando pago para el usuario: ${userId}`);

    // Simulación: suponer que el pago está confirmado si el UID termina en número par
    return parseInt(userId.slice(-1)) % 2 === 0;
  } catch (error) {
    console.error("Error al verificar el pago:", error);
    return false;
  }
}

/** 🔹 RESTRINGIR CONTENIDO SOLO PARA SUSCRIPTORES */
window.restringirContenido = function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && !userDocSnap.data().subscriptionActive) {
          alert("Debes activar tu suscripción.");
          window.location.href = "pago.html";
        }
      } catch (error) {
        console.error("Error al verificar suscripción:", error.message);
      }
    } else {
      window.location.href = "login.html";
/** 🔹 CONFIRMAR PAGO Y ACTIVAR CUENTA */
window.validarPagoEnConfirmacion = async function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Si la suscripción ya está activa, redirigir directamente
          if (userData.subscriptionActive) {
            alert("Tu cuenta ya está activa.");
            window.location.href = "platform.html";
            return;
          }

          // Marcar manualmente como pagado en Firebase
          await updateDoc(userDocRef, { subscriptionActive: true });

          alert("Pago confirmado. Accediendo a la plataforma...");
          window.location.href = "platform.html";
        } else {
          alert("Error: No se encontró información del usuario.");
        }
      } catch (error) {
        console.error("Error al confirmar el pago:", error.message);
        alert("Error al confirmar el pago: " + error.message);
      }
    } else {
      window.location.href = "login.html";
    }
  });
 };
};


    /** 🔹 RESTRINGIR CONTENIDO SOLO PARA SUSCRIPTORES */
window.restringirContenido = function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && !userDocSnap.data().subscriptionActive) {
          alert("Debes activar tu suscripción.");
          window.location.href = "pago.html";
        }
      } catch (error) {
        console.error("Error al verificar suscripción:", error.message);
      }
    } else {
      window.location.href = "login.html";
    }
  });
};


    /** 🔹 REDIRIGIR DESDE INDEX SI YA PAGÓ */
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
        console.error("Error al verificar estado de pago:", error.message);
      }
    }
  });
};


    

/** 🔹 CERRAR SESIÓN */
window.cerrarSesion = async function() {
  try {
    await signOut(auth);
    alert("Sesión cerrada correctamente.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert("Error al cerrar sesión: " + error.message);
  }
};
