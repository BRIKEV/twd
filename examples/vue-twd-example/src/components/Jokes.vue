<script setup lang="ts">
import { ref } from 'vue'

const joke = ref('')
const loading = ref(false)

const fetchJoke = async () => {
  loading.value = true
  joke.value = ''
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random')
    const data = await response.json()
    joke.value = data.value
  } catch (error) {
    console.log(error)
    joke.value = 'Failed to fetch joke.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <button data-twd="joke-button" @click="fetchJoke" :disabled="loading">
      {{ loading ? 'Loading...' : 'Get Chuck Norris Joke' }}
    </button>
    <p v-if="joke" data-twd="joke-text">{{ joke }}</p>
  </div>
</template>

<style scoped>
button {
  margin-top: 1rem;
}
</style>

