<template>
  <el-transfer
    filterable
    :data="dataSource"
    :titles="[' ', ' ']"
    :value="targetKeys"
    @change="handleChange"
  />
</template>
<script>
export default {
  props: {
    value: {
      type: Array,
      required: false,
      default: undefined
    },
    choices: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      targetKeys: [],
      dataSource: []
    }
  },
  watch: {
    value(val) {
      this.targetKeys = this.formatKeys(val)
    },
    choices(val) {
      this.dataSource = this.formatSource(val)
    }
  },
  mounted() {
    this.dataSource = this.formatSource(this.choices)
    this.targetKeys = this.formatKeys(this.value)
  },
  methods: {
    formatSource(source) {
      const rs = []
      Object.entries(source).forEach(item => {
        rs.push({ key: item[0].toString(), label: item[1] })
      })
      return rs
    },
    formatKeys(source) {
      const rs = []
      if (source) {
        source.forEach(item => {
          // form.resetFields 会推一个[undefined]给transfer，晕
          item && rs.push(item.toString())
        })
      }
      return rs
    },
    handleChange(nextTargetKeys) {
      this.$emit('change', nextTargetKeys)
    }
  }
}
</script>
<style lang="scss">
// 穿梭框在弹出框里面会空间不足，padding 30->10
.el-transfer__buttons {
    display: inline-block;
    vertical-align: middle;
    padding: 0 10px;
}
</style>
