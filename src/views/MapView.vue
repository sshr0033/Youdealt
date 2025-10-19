<template>
  <NavBar />

  <section class="map-section">

    <div v-if="!user" class="login-prompt">
      <h2 class="title">Please Log In</h2>
      <p>Log in to view wellbeing centres near you and track your progress.</p>
      <Button
        label="Go to Login"
        icon="pi pi-sign-in"
        @click="$router.push('/login')"
      />
    </div>


    <div v-else>
      <header class="user-header">
        <h2 class="title">Find Mental Wellbeing Support Near You</h2>
      </header>

      <div id="map" class="map"></div>


      <div class="controls">
        <select v-model="selectedSkill">
          <option disabled value="">Select a skill or service</option>
          <option v-for="skill in skills" :key="skill" :value="skill">
            {{ skill }}
          </option>
        </select>
        <button @click="searchPlaces">Search</button>
      </div>

      <div v-if="places.length" class="places-container">
        <h3>Top 5 Nearest Centres for {{ selectedSkill }}</h3>
        <ul>
          <li
            v-for="p in places"
            :key="p.place_id"
            @click="getDirections(p)"
            class="place-item"
          >
            <strong>{{ p.name }}</strong> — {{ p.formatted_address }}
            <br />
            <span v-if="p.distance && p.duration" class="eta">
              {{ p.distance }} • ETA: {{ p.duration }}
            </span>
            <br />
            <button class="join-btn" @click.stop="openJoinDialog(p)">
              Joined this academy?
            </button>
          </li>
        </ul>
      </div>


      <Dialog
        v-model:visible="showJoinDialog"
        modal
        header="Join this Academy"
        :style="{ width: '420px' }"
      >
        <div class="p-fluid">
          <p><strong>Skill:</strong> {{ selectedSkill }}</p>
          <p><strong>Academy:</strong> {{ selectedPlace?.name }}</p>
          <p><strong>Address:</strong> {{ selectedPlace?.formatted_address }}</p>

          <div class="p-field">
            <label>Start Date</label>
            <InputText
              type="date"
              v-model="startDate"
              style="width: 100%; padding: 0.5rem;"
            />
          </div>

          <div class="p-field">
            <label>Duration (weeks)</label>
            <InputNumber v-model="duration" :min="1" :max="52" showButtons />
          </div>

          <div class="p-field">
            <label>Frequency (sessions/week)</label>
            <InputNumber v-model="frequency" :min="1" :max="7" showButtons />
          </div>
        </div>

        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="showJoinDialog = false"
          />
          <Button
            label="Save"
            icon="pi pi-check"
            class="p-button-primary"
            @click="saveJoinedAcademy"
          />
        </template>
      </Dialog>


      <div v-if="joinedAcademies.length" class="academy-table">
        <h3>Your Joined Academies</h3>
        <DataTable
          :value="joinedAcademies"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          filterDisplay="row"
          responsiveLayout="scroll"
        >
          <Column
            field="skill"
            header="Skill"
            sortable
            filter
            filterPlaceholder="Search skill"
          />
          <Column
            field="name"
            header="Academy"
            sortable
            filter
            filterPlaceholder="Search academy"
          />
          <Column field="address" header="Address" sortable />
          <Column field="startDate" header="Start Date" sortable />
          <Column field="duration" header="Duration (weeks)" sortable />
          <Column field="frequency" header="Frequency (/week)" sortable />
          <Column field="completedSessions" header="Completed" sortable />
          <Column header="Target">
            <template #body="{ data }">
              {{ data.frequency * data.duration }}
            </template>
          </Column>
          <Column header="Progress">
            <template #body="{ data }">
              <span class="badge" :class="progressClass(data)">
                {{
                  Math.round(
                    (data.completedSessions /
                      (data.frequency * data.duration)) *
                      100
                  ) || 0
                }}%
              </span>
            </template>
          </Column>
          <Column header="Mark Progress">
            <template #body="{ data }">
              <Button
                icon="pi pi-check"
                rounded
                @click="markProgress(data)"
                :disabled="
                  data.completedSessions >= data.frequency * data.duration
                "
              />
            </template>
          </Column>
        </DataTable>
      </div>


      <div v-if="joinedAcademies.length" class="academy-chart">
        <h3>Lesson Progress by Academy</h3>
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          style="height: 350px; width: 100%; max-width: 900px"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
/* global google */
import { ref, onMounted, nextTick } from "vue";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";


import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chart from "primevue/chart";
import NavBar from "./NavBar.vue";

const selectedSkill = ref("");
const skills = [
  "Mental Health Support",
  "Yoga",
  "Meditation",
  "Therapy",
  "Counselling",
  "Stress Management",
  "Psychologist",
  "Rehabilitation",
];

const places = ref([]);
const joinedAcademies = ref([]);
const chartData = ref({});
const selectedPlace = ref(null);
const showJoinDialog = ref(false);
const startDate = ref(new Date().toISOString().split("T")[0]);
const duration = ref(4);
const frequency = ref(2);
const user = ref(null);

let gmap = null;
let userMarker = null;
let directionsService = null;
let directionsRenderer = null;


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom" } },
  scales: { y: { beginAtZero: true, title: { display: true, text: "Sessions" } } },
};


onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    user.value = u || null;

    if (u) {
      await fetchJoinedAcademies();
      await nextTick();
      loadGoogleMap();
    }
  });
});

function loadGoogleMap() {
  if (!window.google || !window.google.maps) {
    const s = document.createElement("script");
    s.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAIawbRzpIXz3FLC5osYjT2P8nIySjzlk4&libraries=places";
    s.async = true;
    s.defer = true;
    s.onload = initMapSafely;
    document.head.appendChild(s);
  } else {
    initMapSafely();
  }
}

function initMapSafely() {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) {
    console.warn("⏳ Map div not ready — retrying...");
    setTimeout(initMapSafely, 300);
    return;
  }

  gmap = new google.maps.Map(mapDiv, {
    center: { lat: -37.8136, lng: 144.9631 },
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: gmap });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      userMarker = new google.maps.Marker({
        map: gmap,
        position: loc,
        label: "You",
      });
      gmap.setCenter(loc);
    });
  }

  console.log("Google Map initialized checking");
}


async function searchPlaces() {
  if (!selectedSkill.value) return alert("Please select a skill first.");
  const center = gmap.getCenter();
  const url = `https://australia-southeast2-youthealth.cloudfunctions.net/placesText?query=${encodeURIComponent(
    selectedSkill.value
  )}&lat=${center.lat()}&lng=${center.lng()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK")
      return alert(`Error: ${data.error_message || data.status}`);

    const userLoc = userMarker ? userMarker.getPosition() : center;
    const sorted = data.results
      .map((p) => ({
        ...p,
        distanceVal: getDistance(
          userLoc.lat(),
          userLoc.lng(),
          p.geometry.location.lat,
          p.geometry.location.lng
        ),
      }))
      .sort((a, b) => a.distanceVal - b.distanceVal)
      .slice(0, 5);

    places.value = sorted;
    directionsRenderer.setDirections({ routes: [] });
    places.value.forEach((p) =>
      new google.maps.Marker({
        map: gmap,
        position: p.geometry.location,
        title: p.name,
      })
    );
    setTimeout(fetchETAs, 800);
  } catch (err) {
    console.error("Error fetching places:", err);
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fetchETAs() {
  if (!userMarker || !places.value.length) return;
  const from = userMarker.getPosition();
  const destinations = places.value.map((p) => p.geometry.location);
  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    { origins: [from], destinations, travelMode: google.maps.TravelMode.DRIVING },
    (response, status) => {
      if (status === "OK") {
        const results = response.rows[0].elements;
        results.forEach((res, i) => {
          if (res.status === "OK") {
            places.value[i].distance = res.distance.text;
            places.value[i].duration = res.duration.text;
          }
        });
        places.value = [...places.value];
      }
    }
  );
}

function getDirections(p) {
  if (!userMarker) return alert("User location not found yet.");
  const from = userMarker.getPosition();
  const request = {
    origin: from,
    destination: p.geometry.location,
    travelMode: google.maps.TravelMode.DRIVING,
  };
  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK)
      directionsRenderer.setDirections(result);
  });
}

function openJoinDialog(place) {
  selectedPlace.value = place;
  showJoinDialog.value = true;
}

async function saveJoinedAcademy() {
  const entry = {
    skill: selectedSkill.value,
    name: selectedPlace.value.name,
    address: selectedPlace.value.formatted_address,
    startDate: startDate.value,
    duration: Number(duration.value),
    frequency: Number(frequency.value),
    completedSessions: 0,
    createdAt: new Date(),
  };
  const refCol = collection(db, "users", user.value.uid, "joined_academies");
  const docRef = await addDoc(refCol, entry);
  entry.id = docRef.id;
  joinedAcademies.value.push(entry);
  showJoinDialog.value = false;
  updateChart();
}

async function fetchJoinedAcademies() {
  const refCol = collection(db, "users", user.value.uid, "joined_academies");
  const snapshot = await getDocs(refCol);
  joinedAcademies.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  updateChart();
}

async function markProgress(a) {
  const max = a.duration * a.frequency;
  if (a.completedSessions >= max)
    return alert("You’ve completed this program!");
  const newVal = a.completedSessions + 1;
  const ref = doc(db, "users", user.value.uid, "joined_academies", a.id);
  await updateDoc(ref, { completedSessions: newVal });
  a.completedSessions = newVal;
  updateChart();
}

function updateChart() {
  const labels = joinedAcademies.value.map((a) => a.name);
  const completed = joinedAcademies.value.map((a) => a.completedSessions);
  const targets = joinedAcademies.value.map((a) => a.duration * a.frequency);
  chartData.value = {
    labels,
    datasets: [
      { label: "Completed Sessions", data: completed, backgroundColor: "#4CAF50" },
      { label: "Target Sessions", data: targets, backgroundColor: "#D1C4E9" },
    ],
  };
}

function progressClass(a) {
  const t = a.duration * a.frequency;
  const pct = (a.completedSessions / t) * 100 || 0;
  if (pct >= 100) return "badge-done";
  if (pct >= 60) return "badge-good";
  if (pct > 0) return "badge-wip";
  return "badge-idle";
}
</script>

<style scoped>
.map-section { padding: 1rem; background: #f5f2fa; min-height: 100vh; }
.title { text-align: center; margin-bottom: 1rem; color: #4a148c; font-weight: 600; width: 100%; }
.user-header { display: flex; justify-content: space-between; align-items: center; }
.login-prompt { text-align: center; margin-top: 4rem; }
.map { width: 95vw; height: 400px; border-radius: 10px; margin-bottom: 1rem; }
.controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 1rem; }
select, button { padding: 0.6rem 1.2rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
button { background: #673ab7; color: #fff; border: none; cursor: pointer; }
button:hover { background: #512da8; }
.join-btn { margin-top: 0.4rem; background: #4caf50; }
.join-btn:hover { background: #43a047; }
.places-container, .academy-table, .academy-chart {
  width: 90vw; max-width: 1500px; margin: 2rem auto; background: #fff;
  border-radius: 12px; padding: 2rem; box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.badge { padding: 0.25rem 0.5rem; border-radius: 999px; color: #fff; font-size: 0.8rem; }
.badge-idle { background: #9e9e9e; }
.badge-wip { background: #ff9800; }
.badge-good { background: #4caf50; }
.badge-done { background: #3f51b5; }
</style>
