<template>
  <view class="ai-typing-text">
    <text class="content">{{ displayText }}</text>
    <text class="cursor" v-if="isTyping">|</text>
  </view>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  speed: {
    type: Number,
    default: 30
  },
  start: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['done'])

const displayText = ref('')
const isTyping = ref(false)
let timer = null

function startTyping() {
  if (!props.text || !props.start) return
  
  displayText.value = ''
  isTyping.value = true
  let index = 0
  
  timer = setInterval(() => {
    if (index >= props.text.length) {
      stopTyping()
      return
    }
    displayText.value += props.text[index]
    index++
  }, props.speed)
}

function stopTyping() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  isTyping.value = false
  emit('done')
}

watch(() => props.text, (newText) => {
  if (newText && props.start) {
    startTyping()
  }
}, { immediate: true })

watch(() => props.start, (newStart) => {
  if (newStart && props.text) {
    startTyping()
  } else {
    stopTyping()
  }
})

onUnmounted(() => {
  stopTyping()
})
</script>

<style scoped>
.ai-typing-text {
  display: inline;
}

.content {
  font-size: 26rpx;
  line-height: 1.6;
  color: #8A8A8A;
  font-family: 'DM Sans', sans-serif;
}

.cursor {
  display: inline-block;
  color: #A8C5A0;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
