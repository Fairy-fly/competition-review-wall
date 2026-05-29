<template>
  <div ref="chartRef" class="radar-chart"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  scores: {
    type: Object,
    required: true
  }
});

const chartRef = ref(null);
let chartInstance = null;

function renderChart() {
  if (!chartRef.value) {
    return;
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  chartInstance.setOption({
    tooltip: {},
    radar: {
      indicator: [
        { name: "综合", max: 5 },
        { name: "任务", max: 5 },
        { name: "沟通", max: 5 },
        { name: "责任", max: 5 },
        { name: "技术", max: 5 }
      ],
      radius: "62%"
    },
    series: [
      {
        type: "radar",
        areaStyle: {
          color: "rgba(37, 99, 235, 0.16)"
        },
        lineStyle: {
          color: "#2563eb"
        },
        data: [
          {
            value: [
              props.scores.overallScore || 0,
              props.scores.taskScore || 0,
              props.scores.communicationScore || 0,
              props.scores.responsibilityScore || 0,
              props.scores.skillScore || 0
            ],
            name: "协作画像"
          }
        ]
      }
    ]
  });
}

function handleResize() {
  chartInstance?.resize();
}

watch(
  () => props.scores,
  () => renderChart(),
  { deep: true }
);

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
});
</script>

<style scoped>
.radar-chart {
  width: 100%;
  min-height: 320px;
}
</style>
