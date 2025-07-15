<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Gerenciar Raspadinhas</h2>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Nova Raspadinha
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="card in scratchCards"
        :key="card.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="aspect-w-16 aspect-h-9 bg-gray-200">
          <img
            :src="card.image_url || '/assets/scratch.png'"
            :alt="card.title"
            class="w-full h-48 object-cover"
          />
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-semibold text-gray-900">{{ card.title }}</h3>
            <span :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              card.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              {{ card.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-3">{{ card.description }}</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Preço:</span>
              <span class="font-medium">R$ {{ formatCurrency(card.price) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Total:</span>
              <span class="font-medium">{{ card.total_cards }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Vendidos:</span>
              <span class="font-medium">{{ card.sold_cards }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Prêmios:</span>
              <span class="font-medium">{{ card.prizes?.length || 0 }}</span>
            </div>
          </div>
          <div class="mt-4 flex space-x-2">
            <button
              @click="editCard(card)"
              class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
            <button
              @click="toggleCardStatus(card)"
              :class="[
                'flex-1 px-3 py-2 rounded text-sm transition-colors',
                card.is_active 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              {{ card.is_active ? 'Desativar' : 'Ativar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Nova Raspadinha' : 'Editar Raspadinha' }}
          </h3>
          <form @submit.prevent="saveCard" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Título</label>
              <input
                v-model="cardForm.title"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                v-model="cardForm.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                v-model="cardForm.category"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="eletronicos">Eletrônicos</option>
                <option value="eletrodomesticos">Eletrodomésticos</option>
                <option value="camisa-de-futebol">Camisa de Futebol</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Preço (R$)</label>
              <input
                v-model="cardForm.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Total de Cards</label>
              <input
                v-model="cardForm.total_cards"
                type="number"
                min="1"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Probabilidade de Ganhar (%)</label>
              <input
                v-model="cardForm.win_probability"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">URL da Imagem</label>
              <input
                v-model="cardForm.image_url"
                type="url"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {{ showCreateModal ? 'Criar' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const scratchCards = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const cardForm = ref({
  title: '',
  description: '',
  category: 'dinheiro',
  price: 0,
  total_cards: 100,
  win_probability: 10,
  image_url: '/assets/scratch.png'
})

const loadScratchCards = async () => {
  const { data, error } = await adminStore.getScratchCards()
  if (!error) {
    scratchCards.value = data || []
  }
}

const editCard = (card) => {
  cardForm.value = {
    ...card,
    win_probability: card.win_probability * 100 // Convert to percentage
  }
  showEditModal.value = true
}

const saveCard = async () => {
  const formData = {
    ...cardForm.value,
    price: parseFloat(cardForm.value.price),
    total_cards: parseInt(cardForm.value.total_cards),
    win_probability: parseFloat(cardForm.value.win_probability) / 100 // Convert back to decimal
  }

  let result
  if (showCreateModal.value) {
    result = await adminStore.createScratchCard(formData)
  } else {
    result = await adminStore.updateScratchCard(cardForm.value.id, formData)
  }

  if (!result.error) {
    closeModal()
    await loadScratchCards()
  }
}

const toggleCardStatus = async (card) => {
  const { error } = await adminStore.updateScratchCard(card.id, {
    is_active: !card.is_active
  })
  
  if (!error) {
    await loadScratchCards()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  cardForm.value = {
    title: '',
    description: '',
    category: 'dinheiro',
    price: 0,
    total_cards: 100,
    win_probability: 10,
    image_url: '/assets/scratch.png'
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

onMounted(loadScratchCards)
</script>