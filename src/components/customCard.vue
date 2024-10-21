<template>
  <div class="custom-card">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.custom-card {
  width: 345px;
  // min-height: 110px;
  background: #fff;
  border-radius: 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 5px 10px;
}
</style>
