<template>
  <NavBar />

  <section class="goals-section">
    <h2 class="title">My Wellness Goals</h2>


    <div v-if="!user" class="login-warning">
      <p>Please log in to view and track your goals.</p>
      <Button label="Go to Login" @click="goToLogin" />
    </div>


    <div v-else class="goals-container">
      <h3 class="welcome">Make your Goals and track it</h3>



      <div class="goal-toolbar">
        <Button
          label="Add New Goal"
          icon="pi pi-plus"
          class="p-button-rounded p-button-success"
          @click="showDialog = true"
        />
      </div>

      <!-- Add Goal Dialog -->
      <Dialog v-model:visible="showDialog" modal header="Add a New Goal" :style="{ width: '400px' }">
        <div class="p-fluid">
          <div class="p-field">
            <label for="goal">Goal Name</label>
            <InputText id="goal" v-model="newGoal" placeholder="e.g. Meditate 3 days" />
          </div>

          <div class="p-field">
            <label for="days">Total Days</label>
            <InputNumber id="days" v-model="totalDays" :min="1" :max="30" showButtons />
          </div>
        </div>

        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDialog = false" />
          <Button label="Add Goal" icon="pi pi-check" class="p-button-primary" @click="addGoal" />
        </template>
      </Dialog>
      <Dialog v-model:visible="showSuccess" modal header="Email Sent" :style="{ width: '400px' }">
  <div class="success-card">
    <p>Your progress report has been successfully emailed!</p>
    <p>Check your inbox for a copy of the report </p>
  </div>
  <template #footer>
    <Button label="OK" icon="pi pi-check" class="p-button-primary" @click="showSuccess = false" />
  </template>
</Dialog>



      <DataTable
        :value="goals"
        paginator
        :rows="10"
        :filters="filters"
        filterDisplay="row"
        :rowsPerPageOptions="[5, 10, 20]"
        responsiveLayout="scroll"
      >
        <Column field="goal" header="Goal" sortable filter filterPlaceholder="Search goal" />
        <Column field="totalDays" header="Days" sortable />
        <Column field="completedDays" header="Completed" sortable />
        <Column field="streak" header="Streak" sortable />
        <Column header="Mark Progress">
          <template #body="{ data }">
            <Button
              icon="pi pi-check"
              rounded
              @click="markProgress(data)"
              :disabled="data.completedDays >= data.totalDays"
            />
          </template>
        </Column>
      </DataTable>


      <div class="summary-chart" v-if="goals.length > 0">
        <h3>Overall Progress by Goal</h3>
        <Chart
          type="bar"
          :data="barChartData"
          :options="barChartOptions"
          style="width: 100%; max-width: 700px; height: 400px;"
        />
      </div>


      <div class="email-section">
        <Button
          label="Send My Progress Report"
          icon="pi pi-envelope"
          class="p-button-success"
          @click="sendReport"
        />
        <Button
          label="Download PDF Report"
          icon="pi pi-download"
          class="p-button-secondary ml-2"
          @click="downloadReport"
        />
      </div>
    </div>
    <Dialog v-model:visible="showPopup" modal :header="popupTitle" :style="{ width: '400px' }">
  <div class="popup-card" :class="popupType">
    <p>{{ popupMessage }}</p>
  </div>
  <template #footer>
    <Button label="OK" icon="pi pi-check" class="p-button-primary" @click="showPopup = false" />
  </template>
</Dialog>

  </section>
</template>

<script setup>

import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";

import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chart from "primevue/chart";
import NavBar from "./NavBar.vue";

const router = useRouter();

const showSuccess = ref(false)
const showPopup = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const popupType = ref('info')
const user = ref(null);
const goals = ref([]);
const showDialog = ref(false);
const newGoal = ref("");
const totalDays = ref(3);
const isOffline = ref(!navigator.onLine);
const filters = ref({
  goal: { value: null, matchMode: "contains" },
  streak: { value: null, matchMode: "startsWith" },
});


window.addEventListener("online", () => {
  isOffline.value = false;
  fetchGoals();
});
window.addEventListener("offline", () => (isOffline.value = true));

onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    user.value = u;
    if (u) await fetchGoals();
  });
});

const goToLogin = () => router.push("/login");

function showMessage(title, message, type = 'info') {
  popupTitle.value = title
  popupMessage.value = message
  popupType.value = type
  showPopup.value = true
}



async function fetchGoals() {
  const cached = localStorage.getItem("cachedGoals");
  if (cached && goals.value.length === 0) {
    goals.value = JSON.parse(cached);
  }

  if (!navigator.onLine) return;

  try {
    const goalsRef = collection(db, "users", user.value.uid, "goals");
    const q = await getDocs(goalsRef);
    goals.value = q.docs.map((d) => ({ id: d.id, ...d.data() }));
    localStorage.setItem("cachedGoals", JSON.stringify(goals.value));
  } catch (err) {
    console.warn("Firestore fetch failed, using cached data", err);
  }
}


async function addGoal() {
  if (!newGoal.value.trim()) return showMessage("Please enter a goal name");
  if (!user.value) return showMessage("Login required to add a goal");

  const goalData = {
    goal: newGoal.value,
    completedDays: 0,
    totalDays: totalDays.value,
    streak: 0,
    createdAt: new Date(),
  };

  try {
    const goalsRef = collection(db, "users", user.value.uid, "goals");
    const docRef = await addDoc(goalsRef, goalData);
    goals.value.push({ id: docRef.id, ...goalData });
    localStorage.setItem("cachedGoals", JSON.stringify(goals.value));
    showDialog.value = false;
    newGoal.value = "";
    totalDays.value = 3;
  } catch (err) {
    console.error("Failed to add goal:", err);
  }
}


async function markProgress(g) {
  if (!user.value) return showMessage("Login required");
  try {
    const updated = { ...g, completedDays: g.completedDays + 1, streak: g.streak + 1 };
    const goalRef = doc(db, "users", user.value.uid, "goals", g.id);
    await updateDoc(goalRef, updated);
    g.completedDays++;
    g.streak++;
    localStorage.setItem("cachedGoals", JSON.stringify(goals.value));
  } catch (err) {
    console.error("Failed to update progress:", err);
  }
}


const barChartData = computed(() => {
  if (!goals.value.length) return { datasets: [] };
  const labels = goals.value.map((g) => g.goal);
  const completion = goals.value.map((g) =>
    ((g.completedDays / g.totalDays) * 100).toFixed(1)
  );
  return {
    labels,
    datasets: [
      { label: "Completion (%)", data: completion, backgroundColor: "#42b883" },
    ],
  };
});

const barChartOptions = {
  responsive: true,
  scales: {
    y: { beginAtZero: true, title: { display: true, text: "Completion (%)" } },
  },
};

function makeReportPdf() {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("YoutHealth - Weekly Progress Report", 14, 16);
  doc.line(14, 18, 196, 18);
  doc.setFontSize(11);
  doc.text(`User: ${user.value.displayName || user.value.email}`, 14, 26);
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 33);

  doc.setFontSize(12);
  doc.text("Goals Summary:", 14, 42);
  let y = 50;
  goals.value.forEach((g, i) => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(`${i + 1}. ${g.goal} — ${g.completedDays}/${g.totalDays} days`, 14, y);
    y += 8;
  });
  return doc;
}


function downloadReport() {
  const pdf = makeReportPdf();
  pdf.save("Wellness_Progress_Report.pdf");
}


async function sendReport() {
  try {
    if (!user.value) return showMessage("Login required");

    const pdf = makeReportPdf();
    pdf.save("Wellness_Progress_Report.pdf");

    const goalSummary = goals.value
      .map((g) => `• ${g.goal}: ${g.completedDays}/${g.totalDays} days`)
      .join("\n");

    const templateParams = {
      to_email: user.value.email,
      name: user.value.displayName || user.value.email,
      title: "Weekly Progress Summary",
      message:
        `Hello ${user.value.displayName || "there"} 👋,\n\n` +
        `Here’s your wellness progress summary:\n\n${goalSummary}\n\n` +
        `A PDF copy has been downloaded to your device.\n\nKeep up the great work! 🌿✨\n— The YoutHealth Team`,
    };

    const SERVICE_ID = "service_dtrf273";
    const TEMPLATE_ID = "template_3bvdupa";
    const PUBLIC_KEY = "aZy-1f4l1Bvb0yNvO";

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    showSuccess.value = true;

  } catch (err) {
    console.error("Email send error:", err);
    showMessage(" Failed to send email. Check console for details.");
  }
}
</script>

<style scoped>
.goals-section {
  min-height: 100vh;
  width: 98vw;
  padding: 2rem;
  background: #f7f8fc;
}
.title {
  text-align: center;
  color: #4a148c;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.welcome {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
}
.goal-toolbar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.summary-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.email-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.login-warning {
  text-align: center;
  color: #333;
  margin-top: 2rem;
}
.offline-banner {
  background: #ff9800;
  color: white;
  padding: 0.7rem;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
}
.popup-card {
  text-align: center;
  padding: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
  border-radius: 8px;
}

.popup-card.success {
  color: #2e7d32;
  background: #e8f5e9;
}

.popup-card.error {
  color: #c62828;
  background: #ffebee;
}

.popup-card.warning {
  color: #f57c00;
  background: #fff3e0;
}

.popup-card.info {
  color: #1565c0;
  background: #e3f2fd;
}
.p-field {
  margin-bottom: 1rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
}

</style>
