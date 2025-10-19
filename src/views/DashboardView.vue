<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebaseConfig'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import emailjs from '@emailjs/browser'
import { signOut } from 'firebase/auth'

const router = useRouter()
const totalUsers = ref(0)
const totalAdmins = ref(0)
const totalGoals = ref(0)
const userTypeChart = ref(null)
const loading = ref(true)
const allUsers = ref([])
const sending = ref(false)
const message = ref('')

const serviceID = 'service_dtrf273'
const templateID = 'template_3bvdupa'
const publicKey = 'aZy-1f4l1Bvb0yNvO'

async function fetchDashboardData() {
  try {
    const usersSnap = await getDocs(collection(db, 'users'))
    const adminsSnap = await getDocs(collection(db, 'admins'))
    const goalsSnap = await getDocs(collection(db, 'goals'))

    totalUsers.value = usersSnap.size
    totalAdmins.value = adminsSnap.size
    totalGoals.value = goalsSnap.size

    userTypeChart.value = {
      labels: ['Users', 'Admins'],
      datasets: [
        {
          data: [usersSnap.size, adminsSnap.size],
          backgroundColor: ['#42A5F5', '#66BB6A']
        }
      ]
    }

    const userData = usersSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || '—',
      email: doc.data().email || '—',
      type: 'User'
    }))
    const adminData = adminsSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || '—',
      email: doc.data().email || '—',
      type: 'Admin'
    }))
    allUsers.value = [...userData, ...adminData]
  } catch (err) {
    console.error('Error loading admin dashboard:', err)
  } finally {
    loading.value = false
  }
}

async function sendBulkEmail() {
  if (sending.value) return
  sending.value = true
  message.value = ''
  try {
    const emailPromises = allUsers.value.map(async (u) => {
      if (u.email && u.email !== '—') {
        await emailjs.send(
          serviceID,
          templateID,
          {
            to_name: u.name,
            to_email: u.email,
            subject: 'YouthHealth Event Announcement',
            message:
              `Hello ${u.name},\n\nWe are excited to announce a new YouthHealth feature to help you stay motivated and on track with your wellness journey!\n\nStay tuned for more updates.\n\nBest regards,\nThe YouDealt Team`
          },
          publicKey
        )
      }
    })
    await Promise.all(emailPromises)
    message.value = ' Bulk email successfully sent to all users!'
  } catch (err) {
    console.error('Error sending bulk emails:', err)
    message.value = 'Failed to send some emails. Please check the console.'
  } finally {
    sending.value = false
  }
}

async function logout() {
  await signOut(auth)
  router.push('/login')
}

onMounted(async () => {
  const currentUser = auth.currentUser
  if (!currentUser) {
    router.push('/login')
    return
  }
  const adminRef = doc(db, 'admins', currentUser.uid)
  const adminSnap = await getDoc(adminRef)
  if (!adminSnap.exists()) {
    alert('Access denied: Admins only.')
    router.push('/')
    return
  }
  await fetchDashboardData()
})
</script>

<template>
  <main class="admin-dashboard">

    <header class="navbar">
      <div class="brand" @click="$router.push('/')">

        <span class="brand-text"><span class="brand-you">You</span><span class="brand-dealt">Dealt</span></span>
      </div>
      <Button
        label="Logout"
        icon="pi pi-sign-out"
        class="logout-btn"
        @click="logout"
      />
    </header>


    <h1 class="dashboard-title">Admin Dashboard</h1>
    <p class="dashboard-subtitle">Overview of YouthHealth system</p>

    <div v-if="loading" class="loading">Loading dashboard data...</div>

    <div v-else>

      <div class="chart-container" v-if="userTypeChart">

        <Chart type="pie" :data="userTypeChart" />
      </div>


      <div class="email-section">
        <h3>New feature or event? Notify all users</h3>
        <Button
          label="Send Announcement"
          icon="pi pi-envelope"
          class="p-button-success"
          :disabled="sending"
          @click="sendBulkEmail"
        />
        <p v-if="message" class="status">{{ message }}</p>
      </div>


      <div class="table-container">
        <h3>Registered Users</h3>
        <DataTable
          :value="allUsers"
          paginator
          rows="10"
          sortMode="multiple"
          stripedRows
          responsiveLayout="scroll"
        >
          <Column field="name" header="Name" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="type" header="User Type" sortable />
        </DataTable>
      </div>
    </div>
  </main>
</template>

<style scoped>

.navbar {
  width: 98vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.logo {
  width: 42px;
  height: 42px;
  margin-right: 10px;
  border-radius: 50%;
  border: 2px solid #87c8ff;
}
.brand-you {
  color: #000;
  font-weight: 700;
}
.brand-dealt {
  color: #87c8ff;
  font-weight: 700;
  margin-left: 2px;
}
.logout-btn {
  background-color: #87c8ff !important;
  border: none !important;
  color: white !important;
  font-weight: 600;
}
.logout-btn:hover {
  background-color: #e53935 !important;
}


.admin-dashboard {
  max-width: 1000wh;
  margin: 2rem auto;

  padding: 1rem;
}
.dashboard-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;

  margin-top: 1rem;
}
.dashboard-subtitle {
  text-align: center;
  color: #777;
  margin-bottom: 2rem;
}
.chart-container {
  width: 100%;
  max-width: 800px;
  text-align: center;
  margin: 0 auto 2rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.email-section {
  margin-top: 2rem;
  text-align: center;
}
.status {
  margin-top: 0.5rem;
  font-weight: 600;
}
.table-container {
  margin-top: 3rem;
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
}
.loading {
  text-align: center;
  font-size: 1.2rem;
}
</style>
