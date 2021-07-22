<template>
  <el-form
    ref="ruleForm"
    v-loading="loading"
    :model="{}"
    label-width="100px"
  >
    <div v-for="fieldset in fieldsets" :key="fieldset[0]">
      <el-divider v-if="fieldset[0]" content-position="left">{{ fieldset[0] }}</el-divider>
      <el-form-item
        v-for="field in fieldset[1].fields"
        :key="field.name"
        :label="field.label"
      >
        <span>{{ field.value }}</span>
      </el-form-item>
    </div>
  </el-form>
</template>
<script>
/*
  todo: 有空把description实现一下，现在先用 form 顶一下
*/
import * as resource from '@/components/Django/api/resource'
export default {
  props: {
    sourceKey: {
      type: String,
      required: true
    },
    metaInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      fieldsets: []
    }
  },
  watch: {
    sourceKey(val) {
      this.loadData()
    }
  },
  created() {
    this.bindForm()
    this.loadData()
  },
  methods: {
    resetData() {
      this.fieldsets = []
    },
    bindForm() {
      this.resetData()
      const fieldInfos = this.metaInfo.actions.POST
      const sourceFieldsets = this.metaInfo.fieldsets
      const fieldsets = []
      sourceFieldsets.forEach(item => {
        const fields = []
        item[1].fields.forEach(name => {
          const meta = fieldInfos[name]
          fields.push({
            label: meta.label,
            name: name
          })
        })
        fieldsets.push([item[0], { fields: fields }])
      })
      this.fieldsets = fieldsets
    },
    bindData(values) {
      this.fieldsets.forEach(fieldset => {
        const fields = fieldset[1].fields
        fields.forEach(field => {
          let value = values[field.name]
          value = value instanceof Array ? value.join() : value
          field.value = value
        })
      })
    },
    loadData() {
      this.loading = true
      const [app, model] = this.$route.name.split('.')
      resource.getView(app, model, this.sourceKey).then(res => {
        this.bindData(res)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
