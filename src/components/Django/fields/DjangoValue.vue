<template>
  <span v-if="meta && meta.type==='boolean'">
    <i :class="value ? 'el-icon-success' : 'el-icon-error'" :style="{color: value ? 'green': 'red'}" />
  </span>
  <span v-else-if="meta && meta.type==='datetime'">
    {{ valueDatetime }}
  </span>
  <span v-else-if="meta && meta.type==='field' && meta.field_type==='ManyToMany'">
    {{ value && value.join() }}
  </span>
  <span v-else>
    {{ value }}
  </span>
</template>
<script>
import moment from 'moment'
export default {
  props: {
    value: {
      type: [String, Number, Boolean, Array],
      default: null
    },
    meta: {
      type: Object,
      default: null
    }
  },
  computed: {
    valueDatetime() {
      return this.value && moment(this.value).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
