<script setup lang="ts">
const count = ref(0)
</script>

<template>
	<h1 class="text-2xl font-bold">Rule Flow</h1>
	{{ count }}
	<el-button @click="count++">Click me</el-button>
</template>
