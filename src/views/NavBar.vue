<template>
  <header class="navbar">

    <div class="nav-left" @click="$router.push('/')">
      <div class="brand">
        <span class="brand__you">You</span><span class="brand__dealt">Dealt</span>
      </div>
    </div>


    <ul class="nav-links">
      <li><RouterLink to="/homepage">Home</RouterLink></li>
      <li><RouterLink to="/mapview">Wellbeing Map</RouterLink></li>
      <li><RouterLink to="/goals">My Progress</RouterLink></li>
    </ul>


    <div class="nav-right">
      <template v-if="user">
        <div class="profile-container" @click.stop="toggleDropdown">
          <i class="pi pi-user"></i>
          <span class="email">{{ user.name || user.email }}</span>
          <i class="pi" :class="showDropdown ? 'pi-angle-up' : 'pi-angle-down'"></i>
        </div>


        <transition name="fade">
          <div v-if="showDropdown" class="dropdown-menu" :style="dropdownStyle">
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              outlined
              rounded
              size="small"
              class="logout-btn"
              @click="logout"
            />
          </div>
        </transition>
      </template>

      <template v-else>
        <Button
          label="Login"
          icon="pi pi-sign-in"
          class="login-btn"
          @click="$router.push('/login')"
        />
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Button from "primevue/button";

const user = ref(null);
const showDropdown = ref(false);
const router = useRouter();
const dropdownStyle = ref({});

onMounted(() => {
  onAuthStateChanged(auth, (u) => (user.value = u || null));
  document.addEventListener("click", closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});

function toggleDropdown(event) {
  showDropdown.value = !showDropdown.value;

  if (showDropdown.value) {
    nextTick(() => {
      const rect = event.currentTarget.getBoundingClientRect();
      dropdownStyle.value = {
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${rect.right - 180}px`,
      };
    });
  }
}

function closeDropdown(e) {
  if (
    !e.target.closest(".profile-container") &&
    !e.target.closest(".dropdown-menu")
  ) {
    showDropdown.value = false;
  }
}

async function logout() {
  await signOut(auth);
  showDropdown.value = false;
  router.push("/login");
}
</script>

<style scoped>

.navbar {
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 2rem;
  position: sticky;
  top: 0;
  z-index: 9999;
  transition: all 0.3s ease;
}

.brand__you {
  color: #000;
}
.brand__dealt {
  margin-left: 2px;
  color: #87c8ff;
}
.brand {
  font-size: 1.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
}
.brand:hover {
  color: #ffeb3b;
}


.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
}
.nav-links a {
  text-decoration: none;
  color: #87c8ff;
  font-weight: 500;
  transition: 0.3s;
}
.nav-links a.router-link-active {
  color: #ffeb3b;
  font-weight: 600;
}
.nav-links a:hover {
  color: #ffeb3b;
}


.nav-right {
  position: relative;
  display: flex;
  align-items: center;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #87c8ff;
  font-weight: 500;
  user-select: none;
  transition: 0.3s;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
}
.profile-container:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
.email {
  font-size: 0.95rem;
}


.dropdown-menu {
  position: absolute;
  top: 2.8rem;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  color: #4a148c;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 0.8rem 1rem;
  min-width: 150px;
  display: flex;
  justify-content: center;
  z-index: 11000;
}


.login-btn {
  background-color: #43a047 !important;
  border: none !important;
  font-weight: 600;
}
.login-btn:hover {
  background-color: #2e7d32 !important;
}
.logout-btn {
  background-color: #ff5252 !important;
  border: none !important;
  color: white !important;
  font-weight: 600;
}
.logout-btn:hover {
  background-color: #e53935 !important;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


@media (max-width: 900px) {
  .navbar {
    flex-wrap: wrap;
    padding: 0.8rem 1.2rem;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
    margin-top: 0.6rem;
    flex-wrap: wrap;
    gap: 1.2rem;
  }

  .profile-container .email {
    display: none;
  }
}
</style>
