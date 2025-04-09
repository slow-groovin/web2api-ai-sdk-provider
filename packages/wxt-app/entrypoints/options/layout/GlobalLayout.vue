<template>
  <div class="global-layout">
    <aside class="sidebar">
      <nav>
        <ul>
          <li v-for="route in availableRoutes" :key="route.path">
            <router-link :to="route.path">{{ route.name || route.path }}</router-link>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 获取根路由 '/' 下的所有子路由用于侧边栏导航
const availableRoutes = computed(() => {
  const rootRoute = router.options.routes.find(r => r.path === '/');
  return rootRoute?.children || [];
});
</script>

<style scoped>
.global-layout {
  display: flex;
  min-height: 100vh;
  /* Or adjust height as needed */
}

.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  padding: 20px;
  border-right: 1px solid #ccc;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav li {
  margin-bottom: 10px;
}

.sidebar nav a {
  text-decoration: none;
  color: #333;
  display: block;
  padding: 5px 10px;
  border-radius: 4px;
}

.sidebar nav a:hover,
.sidebar nav a.router-link-active {
  background-color: #e0e0e0;
  color: #000;
}

.content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  /* Add scroll if content overflows */
}
</style>
