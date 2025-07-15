<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
      <div class="flex space-x-4">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar usuários..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cadastro
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                  <div class="text-sm text-gray-500">{{ user.phone }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              R$ {{ formatCurrency(user.balance) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                user.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]">
                {{ user.is_active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="editUser(user)"
                class="text-blue-600 hover:text-blue-900"
              >
                Editar
              </button>
              <button
                @click="toggleUserStatus(user)"
                :class="user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
              >
                {{ user.is_active ? 'Desativar' : 'Ativar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ Math.min(currentPage * pageSize, totalUsers) }} de {{ totalUsers }} usuários
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
          :disabled="currentPage * pageSize >= totalUsers"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Editar Usuário</h3>
          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Username</label>
              <input
                v-model="editingUser.username"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="editingUser.email"
                type="email"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Saldo</label>
              <input
                v-model="editingUser.balance"
                type="number"
                step="0.01"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const users = ref([])
const totalUsers = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchTerm = ref('')
const showEditModal = ref(false)
const editingUser = ref({})

const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value
  
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const loadUsers = async () => {
  const { data, error, count } = await adminStore.getUsers(currentPage.value, pageSize.value)
  if (!error) {
    users.value = data || []
    totalUsers.value = count || 0
  }
}

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const saveUser = async () => {
  const { error } = await adminStore.updateUser(editingUser.value.id, {
    username: editingUser.value.username,
    email: editingUser.value.email,
    balance: parseFloat(editingUser.value.balance)
  })
  
  if (!error) {
    showEditModal.value = false
    await loadUsers()
  }
}

const toggleUserStatus = async (user) => {
  const { error } = await adminStore.updateUser(user.id, {
    is_active: !user.is_active
  })
  
  if (!error) {
    await loadUsers()
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

watch(currentPage, loadUsers)

onMounted(loadUsers)
</script>