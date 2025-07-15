<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Configurações Gerais</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome do Site</label>
            <input
              v-model="settings.site_name"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex items-center">
            <input
              id="maintenance_mode"
              v-model="settings.maintenance_mode"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="maintenance_mode" class="ml-2 block text-sm text-gray-900">
              Modo Manutenção
            </label>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Configurações PIX</h3>
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="pix_enabled"
              v-model="settings.pix_enabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="pix_enabled" class="ml-2 block text-sm text-gray-900">
              PIX Habilitado
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Valor Mínimo de Depósito (R$)</label>
            <input
              v-model="settings.min_deposit"
              type="number"
              step="0.01"
              min="0"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Valor Máximo de Depósito (R$)</label>
            <input
              v-model="settings.max_deposit"
              type="number"
              step="0.01"
              min="0"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Taxa de Saque (R$)</label>
            <input
              v-model="settings.withdrawal_fee"
              type="number"
              step="0.01"
              min="0"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="saveSettings"
        :disabled="saving"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="saving">Salvando...</span>
        <span v-else>Salvar Configurações</span>
      </button>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="[
      'p-4 rounded-lg',
      message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    ]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const settings = ref({
  site_name: 'Raspadinha',
  pix_enabled: true,
  min_deposit: 10.00,
  max_deposit: 1000.00,
  withdrawal_fee: 0.00,
  maintenance_mode: false
})

const saving = ref(false)
const message = ref(null)

const loadSettings = async () => {
  const { data, error } = await adminStore.getSettings()
  if (!error && data) {
    data.forEach(setting => {
      let value = JSON.parse(setting.value)
      
      // Convert string numbers to actual numbers for numeric inputs
      if (setting.key.includes('deposit') || setting.key.includes('fee')) {
        value = parseFloat(value)
      }
      
      settings.value[setting.key] = value
    })
  }
}

const saveSettings = async () => {
  saving.value = true
  message.value = null

  try {
    // Save each setting individually
    for (const [key, value] of Object.entries(settings.value)) {
      const { error } = await adminStore.updateSetting(key, value)
      if (error) {
        throw new Error(`Erro ao salvar ${key}: ${error.message}`)
      }
    }

    message.value = {
      type: 'success',
      text: 'Configurações salvas com sucesso!'
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      message.value = null
    }, 3000)

  } catch (error) {
    message.value = {
      type: 'error',
      text: error.message
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>