<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Transações</h2>
      <div class="flex space-x-4">
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="processing">Processando</option>
          <option value="completed">Concluído</option>
          <option value="failed">Falhou</option>
        </select>
        <select
          v-model="typeFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os Tipos</option>
          <option value="deposit">Depósito</option>
          <option value="withdrawal">Saque</option>
          <option value="purchase">Compra</option>
        </select>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
              {{ transaction.id.substring(0, 8) }}...
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ transaction.users?.username || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                getTypeColor(transaction.transaction_type)
              ]">
                {{ getTypeLabel(transaction.transaction_type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              R$ {{ formatCurrency(transaction.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                getStatusColor(transaction.status)
              ]">
                {{ getStatusLabel(transaction.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(transaction.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewTransaction(transaction)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Ver Detalhes
              </button>
              <button
                v-if="transaction.status === 'pending'"
                @click="updateTransactionStatus(transaction, 'completed')"
                class="text-green-600 hover:text-green-900"
              >
                Aprovar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ Math.min(currentPage * pageSize, totalTransactions) }} de {{ totalTransactions }} transações
      </div>
      <div class="flex space-x-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage * pageSize >= totalTransactions"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </div>

    <!-- Transaction Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Detalhes da Transação</h3>
          <div v-if="selectedTransaction" class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">ID</label>
                <p class="text-sm text-gray-900 font-mono">{{ selectedTransaction.id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Usuário</label>
                <p class="text-sm text-gray-900">{{ selectedTransaction.users?.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                <p class="text-sm text-gray-900">{{ getTypeLabel(selectedTransaction.transaction_type) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Valor</label>
                <p class="text-sm text-gray-900">R$ {{ formatCurrency(selectedTransaction.amount) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <p class="text-sm text-gray-900">{{ getStatusLabel(selectedTransaction.status) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Data</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedTransaction.created_at) }}</p>
              </div>
            </div>
            <div v-if="selectedTransaction.pix_code">
              <label class="block text-sm font-medium text-gray-700">Código PIX</label>
              <p class="text-sm text-gray-900 font-mono break-all">{{ selectedTransaction.pix_code }}</p>
            </div>
            <div v-if="selectedTransaction.webhook_data">
              <label class="block text-sm font-medium text-gray-700">Dados do Webhook</label>
              <pre class="text-xs text-gray-900 bg-gray-100 p-2 rounded overflow-auto max-h-32">{{ JSON.stringify(selectedTransaction.webhook_data, null, 2) }}</pre>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              @click="showDetailsModal = false"
              class="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const transactions = ref([])
const totalTransactions = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const statusFilter = ref('')
const typeFilter = ref('')
const showDetailsModal = ref(false)
const selectedTransaction = ref(null)

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (statusFilter.value) {
    filtered = filtered.filter(t => t.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(t => t.transaction_type === typeFilter.value)
  }

  return filtered
})

const loadTransactions = async () => {
  const { data, error, count } = await adminStore.getTransactions(currentPage.value, pageSize.value)
  if (!error) {
    transactions.value = data || []
    totalTransactions.value = count || 0
  }
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailsModal.value = true
}

const updateTransactionStatus = async (transaction, newStatus) => {
  // Implementar lógica para atualizar status da transação
  console.log('Updating transaction status:', transaction.id, newStatus)
}

const getTypeLabel = (type) => {
  const labels = {
    deposit: 'Depósito',
    withdrawal: 'Saque',
    purchase: 'Compra'
  }
  return labels[type] || type
}

const getTypeColor = (type) => {
  const colors = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    purchase: 'bg-blue-100 text-blue-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou'
  }
  return labels[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('pt-BR')
}

watch(currentPage, loadTransactions)

onMounted(loadTransactions)
</script>