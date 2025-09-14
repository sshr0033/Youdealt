<script setup>
import { ref, onMounted } from 'vue'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore'
import { auth } from '../main'

const db = getFirestore()
const router = useRouter()

const rating = ref(null)
const average = ref(0)
const totalRatings = ref(0)
const success = ref('')
const error = ref('')





const userRole = ref(localStorage.getItem('userRole'))


async function submitRating() {
  if (!auth.currentUser) {
    error.value = 'Please log in to rate.'
    return
  }
  if (!rating.value || rating.value < 1 || rating.value > 5) {
    error.value = 'Please choose a rating between 1 and 5.'
    return
  }


  const ratingRef = doc(db, 'ratings', auth.currentUser.uid)
  await setDoc(ratingRef, {
    value: Number(rating.value),
    createdAt: new Date().toISOString()
  })

  success.value = 'Thanks for your rating!'
  await loadAverage()
}

async function loadAverage() {
  try {
    const snapshot = await getDocs(collection(db, 'ratings'))
    const values = snapshot.docs.map(d => d.data().value)
    if (values.length > 0) {
      totalRatings.value = values.length
      average.value = values.reduce((a, b) => a + b, 0) / values.length
    } else {
      average.value = 0
      totalRatings.value = 0
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => loadAverage())

function goHome() {
  if (userRole.value === 'admin') {
    router.push('/admin-homepage')
  } else {
    router.push('/homepage')
  }
}
</script>

<template>
  <main class="ratings-page">
    <h2>Rate the App</h2>


    <div v-if="userRole !== 'admin'" class="rating-container">
      <Rating v-model="rating" :cancel="false" />
      <br />
      <Button @click="submitRating" class="login-primary">Submit Rating</Button>
    </div>

    <div class="mt-3">
      <p>Average Rating: {{ average.toFixed(1) }} ({{ totalRatings }} ratings)</p>
    </div>

    <p v-if="success" class="success">{{ success }}</p>
    <p v-if="error" class="error">{{ error }}</p>


    <p class="login-links">
        <a href="#" @click="goHome">Go To Home Page</a>

      </p>

  </main>
</template>

<style scoped>
.ratings-page {
  margin-top: 2rem;
  text-align: center;
}

.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.success {
  color: green;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
.mt-4 {
  margin-top: 2rem;
}
</style>
