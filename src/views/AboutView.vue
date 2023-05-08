<template>
  <div class="about">
    <h1 class="heading-1">This is an about page</h1>
    <ul>
        <li v-for="task, index in $store.state.completed" :key="`${index}-${task}`">{{ task }}</li>
    </ul>
  </div>
</template>

<script>
export default {
}

</script>
