<template>
  <section class="map-section">
    <h2 class="title">Find Mental Wellbeing Support Near You</h2>
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
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
/* global google */

import { ref, onMounted } from 'vue'

const selectedSkill = ref('')
const skills = [
  'Mental Health Support',
  'Yoga',
  'Meditation',
  'Therapy',
  'Counselling',
  'Stress Management',
  'Psychologist',
  'Rehabilitation',
]

const places = ref([])
let gmap = null
let userMarker = null
let directionsService = null
let directionsRenderer = null


onMounted(() => {
  if (!window.google) {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAIawbRzpIXz3FLC5osYjT2P8nIySjzlk4&libraries=places`
    s.async = true
    s.defer = true
    s.onload = initMap
    document.head.appendChild(s)
  } else initMap()
})

function initMap() {
  gmap = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -37.8136, lng: 144.9631 },
    zoom: 12,
  })

  directionsService = new google.maps.DirectionsService()
  directionsRenderer = new google.maps.DirectionsRenderer({ map: gmap })

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords
      const loc = { lat: latitude, lng: longitude }
      userMarker = new google.maps.Marker({
        map: gmap,
        position: loc,
        label: 'You',
      })
      gmap.setCenter(loc)
    })
  }
}


async function searchPlaces() {
  if (!selectedSkill.value) {
    alert('Please select a skill or service first.')
    return
  }

  const center = gmap.getCenter()
  const lat = center.lat()
  const lng = center.lng()

  const url = `https://australia-southeast2-youthealth.cloudfunctions.net/placesText?query=${encodeURIComponent(
    selectedSkill.value
  )}&lat=${lat}&lng=${lng}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK') {
      alert(`Error: ${data.error_message || data.status}`)
      return
    }

    const userLoc = userMarker ? userMarker.getPosition() : { lat, lng }


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
      .slice(0, 5)

    places.value = sorted
    directionsRenderer.setDirections({ routes: [] })


    places.value.forEach((p) => {
      new google.maps.Marker({
        map: gmap,
        position: p.geometry.location,
        title: p.name,
      })
    })


    setTimeout(fetchETAs, 1000)
  } catch (err) {
    console.error('Error fetching places:', err)
  }
}


function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


function fetchETAs() {
  if (!userMarker || !places.value.length) return

  const from = userMarker.getPosition()
  const service = new google.maps.DistanceMatrixService()
  const destinations = places.value.map((p) => p.geometry.location)

  service.getDistanceMatrix(
    {
      origins: [from],
      destinations,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === 'OK') {
        const results = response.rows[0].elements
        results.forEach((res, i) => {
          if (res.status === 'OK') {
            places.value[i].distance = res.distance.text
            places.value[i].duration = res.duration.text
          }
        })

        places.value = [...places.value]
      } else {
        console.error('ETA fetch failed:', status)
      }
    }
  )
}

function getDirections(p) {
  if (!userMarker) {
    alert('User location not found yet.')
    return
  }

  const from = userMarker.getPosition()
  const to = p.geometry.location

  const request = {
    origin: from,
    destination: to,
    travelMode: google.maps.TravelMode.DRIVING,
  }

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result)
    } else {
      alert(`Directions request failed: ${status}`)
    }
  })
}
</script>

<style scoped>
.map-section {
  padding: 1rem;
  background: #f5f2fa;
  min-height: 100vh;
}

.title {
  text-align: center;
  margin-bottom: 1rem;
  color: #4a148c;
  font-weight: 600;
}

.map {
  width: 95vw;
  height: 400px;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 1rem;
   width: 95vw;
}

select {
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  outline: none;
  max-width: 300px;
}

button {
  padding: 0.6rem 1.2rem;
  background: #673ab7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #512da8;
}

.places-container {
  width: 90vw;
  max-width: 1500px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.place-item {
  cursor: pointer;
  margin: 0.4rem 0;
  color: #333;
  transition: all 0.2s;
}

.place-item:hover {
  color: #673ab7;
  text-decoration: underline;
}

.eta {
  display: inline-block;
  margin-top: 3px;
  color: #555;
  font-size: 0.9rem;
}
</style>
