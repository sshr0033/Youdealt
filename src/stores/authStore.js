
import { ref } from "vue";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const user = ref(null);
let initialized = false;

export function useAuth() {
  if (!initialized) {
    onAuthStateChanged(auth, (u) => {
      user.value = u || null;
    });
    initialized = true;
  }
  return { user };
}
