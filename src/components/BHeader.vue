<template>
  <div class="container">
    <header class="d-flex justify-content-center py-3">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">Login</router-link>

        </li>
        <li class="nav-item">

          <router-link to="/Firelogin" class="nav-link" active-class="active">Firebase Login</router-link>
        </li>
        <li class="nav-item">

          <router-link to="/homePage" class="nav-link" active-class="active">Homepage</router-link>
        </li>
        <li class="nav-item">

          <router-link to="/navbar" class="nav-link" active-class="active">Navbar</router-link>
        </li>
      </ul>
    </header>
  </div>
</template>
