<template>
  <el-form :model="form" label-width="108px" @submit.prevent>
    <el-form-item label="项目名称">
      <el-input v-model="form.name" placeholder="例如：互联网+ 校赛项目" />
    </el-form-item>
    <el-form-item label="竞赛类型">
      <el-input v-model="form.type" placeholder="例如：创新创业、数学建模" />
    </el-form-item>
    <el-form-item label="队伍名称">
      <el-input v-model="form.teamName" placeholder="例如：火力全开队" />
    </el-form-item>
    <el-form-item label="开始时间">
      <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始日期" value-format="YYYY-MM-DD" />
    </el-form-item>
    <el-form-item label="结束时间">
      <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD" />
    </el-form-item>
    <el-form-item label="项目说明">
      <el-input v-model="form.description" type="textarea" :rows="4" placeholder="简单说明项目背景、分工或目标" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="$emit('submit', { ...form })">提交项目</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  initialValue: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(["submit"]);

const form = reactive({
  name: "",
  type: "",
  teamName: "",
  startDate: "",
  endDate: "",
  description: ""
});

watch(
  () => props.initialValue,
  (value) => {
    Object.assign(form, {
      name: value?.name || "",
      type: value?.type || "",
      teamName: value?.teamName || "",
      startDate: value?.startDate || "",
      endDate: value?.endDate || "",
      description: value?.description || ""
    });
  },
  { immediate: true }
);
</script>

